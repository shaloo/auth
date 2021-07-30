import { LoginType } from "./types";

const GOOGLE_INFO_URL = "https://www.googleapis.com/userinfo/v2/me";
const REDDIT_INFO_URL = "https://oauth.reddit.com/api/v1/me";
const TWITCH_INFO_URL = "https://api.twitch.tv/helix/users";
const DISCORD_INFO_URL = "https://discordapp.com/api/oauth2/@me";

const OauthInfoUrlMapping = {
  [LoginType.Reddit]: REDDIT_INFO_URL,
  [LoginType.Google]: GOOGLE_INFO_URL,
  [LoginType.Twitch]: TWITCH_INFO_URL,
  [LoginType.Discord]: DISCORD_INFO_URL,
};
const twitchClaims = {
  id_token: { email: null, email_verified: null },
  userinfo: { email: null, email_verified: null },
};

const expectedOauthParams = {
  [LoginType.Reddit]: ["access_token"],
  [LoginType.Google]: ["access_token", "id_token"],
  [LoginType.Twitch]: ["access_token"],
  [LoginType.Discord]: ["access_token"],
};

const OauthLoginUrlMapping: { [key: string]: { [k: string]: string } } = {
  [LoginType.Reddit]: {
    url: "https://www.reddit.com/api/v1/authorize",
    response_type: "token",
    scope: "identity",
  },
  [LoginType.Google]: {
    url: "https://accounts.google.com/o/oauth2/v2/auth",
    response_type: "token id_token",
    scope: "profile email openid",
    prompt: "consent select_account",
    nonce: "test",
  },
  [LoginType.Twitch]: {
    url: "https://id.twitch.tv/oauth2/authorize",
    response_type: "token",
    scope: "openid user:read:email",
    claims: JSON.stringify(twitchClaims),
  },
  [LoginType.Discord]: {
    url: "https://discord.com/api/oauth2/authorize",
    response_type: "token",
    scope: "email",
  },
};
interface getOauthLoginUrlParams {
  redirectUri: string;
  clientId: string;
  loginType: LoginType;
  state: string;
}

export const getOauthLoginUrl = ({
  loginType,
  redirectUri,
  clientId,
  state,
}: getOauthLoginUrlParams): string => {
  const loginParams = OauthLoginUrlMapping[loginType];
  const url = new URL(loginParams.url);
  url.searchParams.append("client_id", clientId);
  url.searchParams.append("redirect_uri", redirectUri);
  url.searchParams.append("state", state);
  for (const prop in loginParams) {
    if (loginParams.hasOwnProperty(prop) && prop !== "url") {
      url.searchParams.append(prop, loginParams[prop]);
    }
  }
  return url.toString();
};

interface OauthInfoParams {
  loginType: LoginType;
  clientId?: string;
}

export class OauthResponseHandler {
  private request: Request;
  private loginType: LoginType;

  constructor(params: OauthInfoParams) {
    this.loginType = params.loginType;
    this.request = new Request(OauthInfoUrlMapping[params.loginType], {
      headers: {},
    });
    if (params.loginType === LoginType.Twitch) {
      if (params.clientId) {
        this.request.headers.set("Client-ID", params.clientId);
      } else {
        throw new Error("ClientID not set");
      }
    }
  }

  public async getUserInfo(accessToken: string) {
    try {
      this.request.headers.set("Authorization", `Bearer ${accessToken}`);
      const res = await fetch(this.request);
      if (res.status < 400) {
        const data = await res.json();
        return this.getIdFromResponse(data);
      } else {
        const err = await res.text();
        console.log({ err });
        throw new Error(`Error during getting user info`);
      }
    } catch (error) {
      console.log({ error });
      throw new Error(`Error during requesting user info`);
    }
  }

  private getIdFromResponse(jsonResponse: any): { id: string } {
    let response = { id: "" };
    switch (this.loginType) {
      case LoginType.Discord: {
        response.id = jsonResponse.user.id;
        break;
      }
      case LoginType.Google: {
        response.id = jsonResponse.email;
        break;
      }
      case LoginType.Twitch: {
        response.id = jsonResponse?.data[0]?.id;
        break;
      }
      case LoginType.Reddit: {
        response.id = jsonResponse.name;
      }
    }
    return response;
  }
}
