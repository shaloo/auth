import { LoginType } from './types';
import {
  handleRedirectPage,
  getLoginHandler,
  RedirectParams,
  generateID,
  getSentryErrorReporter,
} from './utils';
import { OauthHandler } from './oauth';
import { UserInfo } from './types';
import SessionStore from './sessionStore';
import Popup from './popup';
import { KeyReconstructor } from '@arcana_tech/arcana-keystore';
import {
  getLogger,
  Logger,
  LOG_LEVEL,
  setExceptionReporter,
  setLogLevel,
} from './logger';

interface InitParams {
  appID: string;
  oauthCreds: OAuthCreds[];
  network: 'test' | 'testnet';
}

interface OAuthCreds {
  type: LoginType;
  clientId: string;
  redirectUri: string;
}

enum StoreIndex {
  privateKey,
  userInfo,
}

interface Store {
  set(key: string, value: string, expiresAt?: Date | number): void;
  get(key: string): string | null;
  delete(key: string): void;
  clear(): void;
}

export class AuthProvider {
  public static handleRedirectPage = handleRedirectPage;
  private params: InitParams;
  private store: Store;
  private keyReconstructor: KeyReconstructor;
  private logger: Logger;
  constructor(initParams: InitParams) {
    this.params = initParams;
    this.logger = getLogger('AuthProvider');
    this.keyReconstructor = new KeyReconstructor({
      appID: this.params.appID,
      network: this.params.network || 'test',
    });
    if (this.params.network === 'test') {
      setLogLevel(LOG_LEVEL.DEBUG);
      setExceptionReporter(getSentryErrorReporter());
    } else {
      setLogLevel(LOG_LEVEL.NOLOGS);
    }
    this.store = new SessionStore(this.params.appID);
  }

  public async signIn(loginType: LoginType): Promise<{ privateKey: string }> {
    const creds = this.getOAuthCredentials(loginType);
    if (this.isLoggedIn(loginType)) {
      const key = prefix(StoreIndex[StoreIndex.privateKey], loginType);
      const privateKey = this.store.get(key);
      if (privateKey) {
        return { privateKey };
      }
    }

    const loginHandler = getLoginHandler(loginType, this.params.appID);

    const state = generateID();

    const url = await loginHandler.getAuthUrl({
      clientID: creds.clientId,
      redirectUri: creds.redirectUri,
      state,
    });

    const popup = new Popup(url, state);
    popup.open();

    const params = await popup.getWindowResponse(
      loginHandler.handleRedirectParams
    );
    try {
      const userInfo = await this.getInfoFromHandler(loginHandler, params);
      const privateKey = await this.getUserPrivateKey(
        userInfo.id,
        params.id_token,
        loginType
      );

      this.setKeyAndUserInfo(privateKey, userInfo, loginType);

      return { privateKey };
    } catch (err) {
      return Promise.reject(err);
    } finally {
      await loginHandler.cleanup();
    }
  }

  public async getUserInfo(loginType: LoginType): Promise<UserInfo> {
    const key = prefix(StoreIndex[StoreIndex.userInfo], loginType);
    const userInfo = this.store.get(key);
    if (userInfo) {
      const info: UserInfo = JSON.parse(userInfo);
      return info;
    } else {
      this.logger.error('Error: getUserInfo', { loginType });
      throw new Error('Please initialize the sdk before fetching user info.');
    }
  }

  public isLoggedIn(loginType: LoginType): boolean {
    const key = prefix(StoreIndex[StoreIndex.privateKey], loginType);
    const privateKey = this.store.get(key);
    if (privateKey) {
      return true;
    }
    return false;
  }

  public clearSession(): void {
    this.store.clear();
  }

  public getPublicKey({
    id,
    verifier,
  }: {
    id: string;
    verifier: LoginType;
  }): Promise<{ X: string; Y: string }> {
    return this.keyReconstructor.getPublicKey({ id, verifier });
  }

  private setKeyAndUserInfo(
    pk: string,
    userInfo: UserInfo,
    loginType: LoginType
  ) {
    this.store.set(prefix(StoreIndex[StoreIndex.privateKey], loginType), pk);
    this.store.set(
      prefix(StoreIndex[StoreIndex.userInfo], loginType),
      JSON.stringify(userInfo)
    );
  }
  private getOAuthCredentials(loginType: LoginType): OAuthCreds {
    for (const creds of this.params.oauthCreds) {
      if (creds.type == loginType.valueOf()) {
        if (creds.clientId && creds.redirectUri) {
          return creds;
        }
      }
    }
    this.logger.error(`OAuth creds not found for ${loginType} login`);
    throw new Error(`OAuth creds not found for ${loginType} login`);
  }

  private async getInfoFromHandler(
    handler: OauthHandler,
    params: RedirectParams
  ) {
    if (params.access_token) {
      const userInfo = await handler.getUserInfo(params.access_token);
      return userInfo;
    } else {
      throw new Error('access token missing');
    }
  }

  private async getUserPrivateKey(
    id: string,
    token: string | undefined,
    loginType: LoginType
  ): Promise<string> {
    if (!id || !token || !loginType) {
      return Promise.reject('Invalid params');
    }
    try {
      const data = await this.keyReconstructor.getPrivateKey({
        id,
        idToken: token,
        verifier: loginType,
      });
      const logger = getLogger('getUserPrivateKey');
      logger.info('return_data', data);
      return data.privateKey;
    } catch (e) {
      this.logger.error(`Error during getting pvt key`, { e });
      return Promise.reject('Error during getting user key');
    }
  }
}

const prefix = (s: string, prefix: string): string => {
  return `${prefix}:${s}`;
};
