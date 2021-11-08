import { LoginType, Store, StoredUserInfo } from './types';
import {
  handleRedirectPage,
  getLoginHandler,
  RedirectParams,
  generateID,
  getSentryErrorReporter,
} from './utils';
import { OauthHandler } from './oauth';
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
  redirectUri?: string;
  oauthCreds: OAuthCreds[];
  network: 'test' | 'testnet';
}

interface OAuthCreds {
  type: LoginType;
  clientId: string;
  redirectUri: string;
}

enum StoreIndex {
  LOGGED_IN = 'arc.user',
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

  public async login(loginType: LoginType): Promise<void> {
    if (this.checkAlreadyLoggedIn(loginType)) {
      return;
    }

    const creds = this.getOAuthCredentials(loginType);

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
      this.setKeyAndUserInfo({ privateKey, userInfo, loginType });
    } catch (err) {
      return Promise.reject(err);
    } finally {
      await loginHandler.cleanup();
    }
  }

  public getUserInfo(): StoredUserInfo {
    const userInfo = this.store.get(StoreIndex.LOGGED_IN);
    if (userInfo) {
      const info: StoredUserInfo = JSON.parse(userInfo);
      return info;
    } else {
      this.logger.error('Error: getUserInfo');
      throw new Error('Please initialize the sdk before fetching user info.');
    }
  }

  public isLoggedIn(): boolean {
    const userExists = this.store.get(StoreIndex.LOGGED_IN);
    return userExists ? true : false;
  }

  public logout(): void {
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

  private checkAlreadyLoggedIn(loginType: LoginType): boolean {
    if (this.isLoggedIn()) {
      const storedUserInfo = this.getUserInfo();
      if (storedUserInfo.loginType === loginType) {
        return true;
      }
    }
    return false;
  }

  private setKeyAndUserInfo(userInfo: StoredUserInfo) {
    this.store.set(StoreIndex.LOGGED_IN, JSON.stringify(userInfo));
  }

  private getOAuthCredentials(loginType: LoginType): OAuthCreds {
    for (const creds of this.params.oauthCreds) {
      if (creds.type == loginType.valueOf()) {
        if (creds.clientId && creds.redirectUri) {
          return creds;
        } else if (creds.clientId && this.params.redirectUri) {
          return {
            ...creds,
            redirectUri: this.params.redirectUri,
          };
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
