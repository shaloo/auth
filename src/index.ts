import { LoginType } from "./types";
import { getOauthLoginUrl, OauthResponseHandler } from "./utils";
import { getPrivateKey } from "dkg_client";

interface InitParams {
  loginType: LoginType;
  verifierId: string;
  clientId: string;
  redirectUri: string;
}

interface HashParams {
  access_token: string;
  id_token: string;
}

export class ArcanaLogin {
  private params: InitParams;
  private window: Window;
  private userInfo: { id: string; email?: string; name?: string };
  private id: string;
  private privateKey: string = "";
  constructor(initParams: InitParams) {
    this.params = initParams;
  }

  public async doLogin() {
    this.id = generateID();
    const url = getOauthLoginUrl({
      loginType: this.params.loginType,
      clientId: this.params.clientId,
      redirectUri: this.params.redirectUri,
      state: this.id,
    });
    const windowFeatures = "resizable=no,height=700,width=1200";
    const win = window.open(url, "_blank", windowFeatures);
    if (win) {
        this.window = win;
        const response = await this.handleWindowResponse(win, this.id);
        return response;
    }
  }

  private handleWindowResponse(win: Window, id: string) {
    return new Promise((resolve, reject) => {
      const handler = async (event: MessageEvent) => {
        console.log("Got message on channel");
        console.log({ event });
        const { status, params, error = null } = event.data;
        if (params.state !== id) {
          return;
        }
        window.removeEventListener("message", handler);
        win.close();
        if (status === "success") {
          const hashParams = this.extractParamsFromLogin(params);
          const privateKey = await this.fetchUserInfoAndPrivateKey(hashParams);
          return resolve({ privateKey });
        } else {
          return reject(error);
        }
      };
      window.addEventListener("message", handler, false);
    });
  }

  private extractParamsFromLogin(params: HashParams) {
    let { access_token, id_token = "" } = params;
    if (!id_token) {
      id_token = access_token;
    }
    console.log({ extractParamsFromLogin: params });
    return { access_token, id_token };
  }

  private async fetchUserInfoAndPrivateKey({
    id_token,
    access_token,
  }: HashParams) {
    await this.getUserInfoFromToken(access_token);
    const privateKey = await this.getUserPrivateKey(id_token);
    this.privateKey = privateKey;
    return this.privateKey;
  }

  private async getUserInfoFromToken(accessToken: string) {
    const oauthResponseHandler = new OauthResponseHandler({
      loginType: this.params.loginType,
      clientId: this.params.clientId,
    });
    console.log({ oauthResponseHandler });

    const userInfo = await oauthResponseHandler.getUserInfo(accessToken);

    console.log({ userInfo });

    this.userInfo = userInfo;
  }

  private async getUserPrivateKey(idToken: string): Promise<string> {
    const { id } = this.userInfo;
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
  return "_" + Math.random().toString(36).substr(2, 9);
};
