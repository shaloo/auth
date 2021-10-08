import { LoginType } from './types';
import { handleRedirectPage, getLoginHandler, RedirectParams } from './utils';
import { OauthHandler } from './oauth';
import { UserInfo } from './types';
import { default as KeyReconstructor } from '@arcana-tech/arcana_keystore';
import SessionStore from './sessionStore';
import Popup from './popup';

interface InitParams {
  appAddress: string;
  loginType: LoginType;
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
}

export class AuthProvider {
  public static handleRedirectPage = handleRedirectPage;
  private params: InitParams;
  private id: string;
  private loginHandler: OauthHandler;
  private store: Store;
  constructor(initParams: InitParams) {
    this.params = initParams;
    this.store = new SessionStore(this.params.loginType);
  }

  public async signIn(): Promise<{ privateKey: string }> {
    if (this.isLoggedIn()) {
      const privateKey = this.store.get(StoreIndex[StoreIndex.privateKey]);
      if (privateKey) {
        return { privateKey };
      }
    }

    this.loginHandler = getLoginHandler(
      this.params.loginType,
      this.params.appAddress
    );

    const url = await this.loginHandler.getAuthUrl({
      clientID: this.params.clientId,
      redirectUri: this.params.redirectUri,
      state: this.id,
    });

    const popup = new Popup(url);
    popup.open();
    const params = await popup.getWindowResponse();
    const privateKey = await this.fetchUserInfoAndPrivateKey(params);
    return { privateKey };
  }

  public async getUserInfo(): Promise<UserInfo> {
    const userInfo = this.store.get(StoreIndex[StoreIndex.userInfo]);
    if (userInfo) {
      const info: UserInfo = JSON.parse(userInfo);
      return info;
    } else {
      throw new Error('Please initialize the sdk before fetching user info.');
    }
  }

  public isLoggedIn(): boolean {
    const privateKey = this.store.get(StoreIndex[StoreIndex.privateKey]);
    if (privateKey) {
      return true;
    }
    return false;
  }

  private async fetchUserInfoAndPrivateKey(params: RedirectParams) {
    params = await this.loginHandler.handleRedirectParams(params);
    if (!params.access_token || !params.id_token) {
      throw new Error('Error on redirect params');
    }
    const id = await this.getUserInfoFromToken(params.access_token);
    const privateKey = await this.getUserPrivateKey(id, params.id_token);

    this.store.set(StoreIndex[StoreIndex.privateKey], privateKey);

    return privateKey;
  }

  private async getUserInfoFromToken(accessToken: string): Promise<string> {
    const userInfo = await this.loginHandler.getUserInfo(accessToken);
    this.store.set(StoreIndex[StoreIndex.userInfo], JSON.stringify(userInfo));
    return userInfo.id;
  }

  private async getUserPrivateKey(
    id: string,
    idToken: string
  ): Promise<string> {
    console.log({ id, idToken, KeyReconstructor });
    const keystore = new KeyReconstructor(this.params.appAddress);
    const data = await keystore.getPrivateKey({
      idToken,
      id,
      verifier: this.params.loginType,
    });
    console.log({ getUserPrivateKey: data });
    return data.privateKey;
  }
}
