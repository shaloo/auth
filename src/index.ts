import { LoginType, OAuthFetcher, Store, StoredUserInfo } from './types';
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
import { KeyReconstructor } from '@arcana/keystore';
import {
  getLogger,
  Logger,
  LOG_LEVEL,
  setExceptionReporter,
  setLogLevel,
} from './logger';
import Config from './config';
import { OAuthContractMeta } from './oauthMeta';
import { ArcanaAuthException } from './errors';

interface InitParams {
  appID: string;
  redirectUri: string;
  network: 'test' | 'testnet';
  rpcUrl?: string;
}

enum StoreIndex {
  LOGGED_IN = 'arc.user',
}

const getAppAddress = async (appID: string): Promise<string> => {
  try {
    const res = await fetch(`${Config.gatewayUrl}/get-address/?id=${appID}`);
    const json: { address: string } = await res.json();
    return json.address;
  } catch (e) {
    throw new ArcanaAuthException(`Invalid appID: ${appID}`);
  }
};

const getCurrentConfig = async (): Promise<string> => {
  try {
    const res = await fetch(`${Config.gatewayUrl}/get-config/`);
    const json: { RPC_URL: string } = await res.json();
    return json.RPC_URL;
  } catch (e) {
    throw new ArcanaAuthException(`Error during fetching config`);
  }
};

export class AuthProvider {
  public static handleRedirectPage = handleRedirectPage;
  private params: InitParams;
  private oauthStore: OAuthFetcher;
  private store: Store;
  private keyReconstructor: KeyReconstructor;
  private logger: Logger;
  private appAddress = '';
  constructor(initParams: InitParams) {
    this.params = initParams;

    if (this.params.network === 'test') {
      setLogLevel(LOG_LEVEL.DEBUG);
      setExceptionReporter(getSentryErrorReporter());
    } else {
      setLogLevel(LOG_LEVEL.NOLOGS);
    }
    this.logger = getLogger('AuthProvider');
    this.store = new SessionStore(this.params.appID);
  }

  public async loginWithSocial(loginType: LoginType): Promise<void> {
    if (this.checkAlreadyLoggedIn(loginType)) {
      return;
    }

    await this.init();

    const clientID = await this.fetchClientID(loginType);

    this.logger.info('clientID', clientID);

    const loginHandler = getLoginHandler(loginType, this.appAddress);

    const state = generateID();

    const url = await loginHandler.getAuthUrl({
      clientID: clientID,
      redirectUri: this.params.redirectUri,
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
      throw new ArcanaAuthException('Please initialize the sdk before fetching user info.');
    }
  }

  public isLoggedIn(): boolean {
    const userExists = this.store.get(StoreIndex.LOGGED_IN);
    return userExists ? true : false;
  }

  public logout(): void {
    this.store.clear();
  }

  public async getPublicKey({
    id,
    verifier,
  }: {
    id: string;
    verifier: LoginType;
  }): Promise<{ X: string; Y: string }> {
    await this.initKeyReconstructor();
    return this.keyReconstructor.getPublicKey({ id, verifier });
  }

  private async initConfig(): Promise<string> {
    try {
      const rpcUrl = await getCurrentConfig();
      return rpcUrl;
    } catch (e) {
      this.logger.error('Error during config init', e);
      throw e;
    }
  }

  private async initKeyReconstructor(): Promise<void> {
    await this.setAppAddress();
    if (!this.keyReconstructor) {
      this.keyReconstructor = new KeyReconstructor({
        appID: this.appAddress,
        network: this.params.network || 'test',
      });
    }
  }

  private async init(): Promise<void> {
    if (!this.params.rpcUrl) {
      const rpcUrl = await this.initConfig();
      this.params.rpcUrl = rpcUrl;
    }
    await this.initKeyReconstructor();
    this.oauthStore = new OAuthContractMeta(
      this.appAddress,
      this.params.rpcUrl
    );
  }

  private async fetchClientID(loginType: LoginType): Promise<string> {
    const clientID = await this.oauthStore.getClientID(loginType);
    if (!clientID) {
      throw new ArcanaAuthException(`Client ID not found for ${loginType}`);
    }
    return clientID;
  }

  private async setAppAddress(): Promise<void> {
    if (!this.appAddress) {
      const appAddress = await getAppAddress(this.params.appID);
      if (appAddress.length === 0) {
        throw new ArcanaAuthException('Address non-existent or invalid, are you sure the App ID referenced exists?');
      }
      this.appAddress = appAddress;
    }
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

  private async getInfoFromHandler(
    handler: OauthHandler,
    params: RedirectParams
  ) {
    if (params.access_token) {
      const userInfo = await handler.getUserInfo(params.access_token);
      return userInfo;
    } else {
      throw new ArcanaAuthException('access token missing');
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
