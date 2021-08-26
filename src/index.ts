import { LoginType } from './types';
import { handleRedirectPage, getInfoHandler } from './utils';
import { getOauthLoginUrl } from './oauth';
import { getPrivateKey } from 'dkg_client';
import { UserInfo } from './types';

interface InitParams {
  appAddress: string;
  loginType: LoginType;
  clientId: string;
  redirectUri: string;
}

interface HashParams {
  access_token: string;
  id_token: string;
}

export class ArcanaLogin {
  public static handleRedirectPage = handleRedirectPage;
  private params: InitParams;
  private userInfo: UserInfo;
  private id: string;
  private privateKey = '';
  constructor(initParams: InitParams) {
    this.params = initParams;
  }

  public async go(): Promise<{ privateKey: string }> {
    this.id = generateID();
    const url = getOauthLoginUrl({
      loginType: this.params.loginType,
      clientId: this.params.clientId,
      redirectUri: this.params.redirectUri,
      state: this.id,
    });
    const windowFeatures = 'resizable=no,height=700,width=1200';
    const win = window.open(url, '_blank', windowFeatures);
    if (win) {
      const response = await this.handleWindowResponse(win, this.id);
      return response;
    } else {
      throw new Error('Could not open login window');
    }
  }

  public async getUserInfo(): Promise<UserInfo> {
    if (this.userInfo) {
      return this.userInfo;
    } else {
      throw new Error('Please initialize the sdk before fetching user info.');
    }
  }

  private handleWindowResponse(
    win: Window,
    id: string
  ): Promise<{ privateKey: string }> {
    return new Promise((resolve, reject) => {
      const handler = async (event: MessageEvent) => {
        const { status, params, error = null } = event.data;
        if (params.state !== id) {
          return;
        }
        window.removeEventListener('message', handler);
        win.close();
        if (status === 'success') {
          const privateKey = await this.fetchUserInfoAndPrivateKey(params);
          return resolve({ privateKey });
        } else {
          return reject(error);
        }
      };
      window.addEventListener('message', handler, false);
    });
  }

  private async fetchUserInfoAndPrivateKey({
    id_token: idToken,
    access_token: accessToken,
  }: HashParams) {
    if (!idToken) {
      idToken = accessToken;
    }
    const id = await this.getUserInfoFromToken(accessToken);
    const privateKey = await this.getUserPrivateKey(id, idToken);
    this.privateKey = privateKey;
    return this.privateKey;
  }

  private async getUserInfoFromToken(accessToken: string): Promise<string> {
    const infoHandler = getInfoHandler(
      this.params.loginType,
      this.params.clientId
    );
    const userInfo = await infoHandler.getUserInfo(accessToken);
    this.userInfo = userInfo;
    return this.userInfo.id;
  }

  private async getUserPrivateKey(
    id: string,
    idToken: string
  ): Promise<string> {
    console.log({ id, idToken });
    const data = await getPrivateKey({
      idToken,
      id,
      verifier: this.params.loginType,
    });
    console.log({ getUserPrivateKey: data });
    return data.privateKey;
  }
}

const generateID = function () {
  return '_' + Math.random().toString(36).substr(2, 9);
};
