import { LoginType, UserInfo } from './types';

const OauthLoginUrlMapping: { [key: string]: { [k: string]: string } } = {
  [LoginType.Reddit]: {
    url: 'https://www.reddit.com/api/v1/authorize',
    response_type: 'token',
    scope: 'identity',
  },
  [LoginType.Google]: {
    url: 'https://accounts.google.com/o/oauth2/v2/auth',
    response_type: 'token id_token',
    scope: 'profile email openid',
    prompt: 'consent select_account',
    nonce: 'test',
  },
  [LoginType.Twitch]: {
    url: 'https://id.twitch.tv/oauth2/authorize',
    response_type: 'token',
    scope: 'openid user:read:email',
    claims: JSON.stringify({
      id_token: { email: null, email_verified: null },
      userinfo: { email: null, email_verified: null },
    }),
  },
  [LoginType.Discord]: {
    url: 'https://discord.com/api/oauth2/authorize',
    response_type: 'token',
    scope: 'email',
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
  url.searchParams.append('client_id', clientId);
  url.searchParams.append('redirect_uri', redirectUri);
  url.searchParams.append('state', state);
  for (const prop in loginParams) {
    if (prop !== 'url') {
      url.searchParams.append(prop, loginParams[prop]);
    }
  }
  return url.toString();
};

export interface OauthInfoFetcher {
  getUserInfo(accessToken: string): Promise<UserInfo>;
}

const request = async <T>(
  url: string,
  headers: { [key: string]: string }
): Promise<T> => {
  const response = await fetch(url, { headers });
  const data = await response.json();
  if (response.status < 400) {
    return data as T;
  } else {
    console.log({ err: data });
    throw new Error(`Error during getting user info`);
  }
};
export class GoogleInfo implements OauthInfoFetcher {
  private url: string;
  constructor() {
    this.url = 'https://www.googleapis.com/userinfo/v2/me';
  }

  public async getUserInfo(
    accessToken: string,
    r: typeof request = request
  ): Promise<UserInfo> {
    try {
      const data = await r<{ email: string }>(this.url, {
        Authorization: `Bearer ${accessToken}`,
      });
      return { id: data.email };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export class RedditInfo implements OauthInfoFetcher {
  private url: string;
  constructor() {
    this.url = 'https://oauth.reddit.com/api/v1/me';
  }

  public async getUserInfo(
    accessToken: string,
    r: typeof request = request
  ): Promise<UserInfo> {
    try {
      const data = await r<{ name: string }>(this.url, {
        Authorization: `Bearer ${accessToken}`,
      });
      return { id: data.name };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export class DiscordInfo implements OauthInfoFetcher {
  private url: string;
  constructor() {
    this.url = 'https://discordapp.com/api/oauth2/@me';
  }

  public async getUserInfo(
    accessToken: string,
    r: typeof request = request
  ): Promise<UserInfo> {
    try {
      const data = await r<{ user: { id: string } }>(this.url, {
        Authorization: `Bearer ${accessToken}`,
      });
      return { id: data.user.id };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

export class TwitchInfo implements OauthInfoFetcher {
  private url: string;
  private clientId: string;
  constructor(clientId: string) {
    this.url = 'https://api.twitch.tv/helix/users';
    this.clientId = clientId;
  }

  public async getUserInfo(
    accessToken: string,
    r: typeof request = request
  ): Promise<UserInfo> {
    try {
      const data = await r<{ data: Array<{ id: string }> }>(this.url, {
        Authorization: `Bearer ${accessToken}`,
        'Client-ID': this.clientId,
      });
      return { id: data.data[0]?.id };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}
