import { UserInfo } from './types';
import { generateID, RedirectParams } from './utils';

interface OauthParams {
  redirectUri: string;
  state: string;
  clientID: string;
  nonce?: string;
}

export interface OauthHandler {
  getAuthUrl(params: OauthParams): Promise<string>;
  getUserInfo(accessToken: string): Promise<UserInfo>;
  handleRedirectParams(params: RedirectParams): Promise<RedirectParams>;
}

export const request = async <T>(
  url: string,
  headers: { [key: string]: string } = {}
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

interface GoogleUserInfoResponse {
  email: string;
  name: string;
  id: string;
  picture: string;
}

export class GoogleHandler implements OauthHandler {
  private oauthUrl = 'https://accounts.google.com/o/oauth2/v2/auth';
  private responseType = 'token id_token';
  private scope = 'profile email openid';
  private prompt = 'consent select_account';
  private userInfoUrl = 'https://www.googleapis.com/userinfo/v2/me';

  constructor(private appID: string) {
    return;
  }

  public async getAuthUrl({
    clientID,
    redirectUri,
    state,
    nonce,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', clientID);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    url.searchParams.append('prompt', this.prompt);
    url.searchParams.append('nonce', nonce ? nonce : generateID());
    return url.toString();
  }

  public async handleRedirectParams(
    params: RedirectParams
  ): Promise<RedirectParams> {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  }

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<GoogleUserInfoResponse>(this.userInfoUrl, {
        Authorization: `Bearer ${accessToken}`,
      });
      return { id: data.email, name: data.name, picture: data.picture };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

interface RedditUserInfoResponse {
  name: string;
  id: string;
  icon_img: string;
}

export class RedditHandler implements OauthHandler {
  private userInfoUrl = 'https://oauth.reddit.com/api/v1/me';
  private scope = 'identity';
  private responseType = 'token';
  private oauthUrl = 'https://www.reddit.com/api/v1/authorize';
  constructor(private appID: string) {
    return;
  }

  public async getAuthUrl({
    clientID,
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', clientID);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    return url.toString();
  }

  public async handleRedirectParams(
    params: RedirectParams
  ): Promise<RedirectParams> {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  }

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<RedditUserInfoResponse>(this.userInfoUrl, {
        Authorization: `Bearer ${accessToken}`,
      });
      return { id: data.name, name: data.name, picture: data.icon_img };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

interface DiscordUserInfoResponse {
  id: string;
  avatar: string;
  username: string;
}

export class DiscordHandler implements OauthHandler {
  private oauthUrl = 'https://discord.com/api/oauth2/authorize';
  private responseType = 'token';
  private scope = 'identify email';
  private userInfoUrl = 'https://discordapp.com/api/oauth2/@me';

  constructor(private appID: string) {
    return;
  }

  public async getAuthUrl({
    clientID,
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', clientID);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    return url.toString();
  }

  public async handleRedirectParams(
    params: RedirectParams
  ): Promise<RedirectParams> {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  }

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<{ user: DiscordUserInfoResponse }>(
        this.userInfoUrl,
        {
          Authorization: `Bearer ${accessToken}`,
        }
      );
      return {
        id: data.user.id,
        name: data.user.username,
        picture: data.user.avatar,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

interface TwitchUserInfoResponse {
  id: string;
  email: string;
  display_name: string;
  profile_image_url: string;
}

export class TwitchHandler implements OauthHandler {
  private clientId: string;
  private userInfoUrl = 'https://api.twitch.tv/helix/users';
  private oauthUrl = 'https://id.twitch.tv/oauth2/authorize';
  private scope = 'openid user:read:email';
  private responseType = 'token';
  private claims = JSON.stringify({
    id_token: { email: null, email_verified: null },
    userinfo: { email: null, email_verified: null },
  });

  constructor(private appID: string) {
    return;
  }

  public async getAuthUrl({
    clientID,
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    this.clientId = clientID;

    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', clientID);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    url.searchParams.append('claims', this.claims);
    return url.toString();
  }

  public async handleRedirectParams(
    params: RedirectParams
  ): Promise<RedirectParams> {
    if (params.access_token && !params.id_token) {
      return {
        ...params,
        id_token: params.access_token,
      };
    } else {
      return { ...params };
    }
  }

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<{ data: TwitchUserInfoResponse[] }>(
        this.userInfoUrl,
        {
          Authorization: `Bearer ${accessToken}`,
          'Client-ID': this.clientId,
        }
      );
      return {
        id: data.data[0]?.email ? data.data[0]?.email : data.data[0]?.id,
        name: data.data[0]?.display_name,
        picture: data.data[0]?.profile_image_url,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

interface GithubUserInfoResponse {
  id: number;
  email: string;
  name: string;
  avatar_url: string;
}

export class GithubHandler implements OauthHandler {
  private url = 'https://api.github.com/user';
  private oauthUrl = 'https://github.com/login/oauth/authorize';
  private sigUrl = 'https://oauth.arcana.network/oauth/github';
  private responseType = 'token id_token';
  private scope = 'read:user user:email';
  constructor(private appID: string) {
    return;
  }

  public async getAuthUrl({
    clientID,
    redirectUri,
    state,
  }: OauthParams): Promise<string> {
    const url = new URL(this.oauthUrl);
    url.searchParams.append('client_id', clientID);
    url.searchParams.append('redirect_uri', redirectUri);
    url.searchParams.append('state', state);
    url.searchParams.append('scope', this.scope);
    url.searchParams.append('response_type', this.responseType);
    return url.toString();
  }

  private async getTokenFromCode(appID: string, code: string): Promise<string> {
    const data = await request<{ accessToken: string }>(
      `${this.sigUrl}/${appID}/${code}`
    );
    return data.accessToken;
  }

  public async handleRedirectParams(
    params: RedirectParams
  ): Promise<RedirectParams> {
    if (!params.code) {
      throw new Error('Expected `code` from github hash params');
    }
    const accessToken = await this.getTokenFromCode(this.appID, params.code);

    return { ...params, access_token: accessToken, id_token: accessToken };
  }

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const data = await request<GithubUserInfoResponse>(this.url, {
        Authorization: `token ${accessToken}`,
      });
      return {
        id: data.email ? data.email : String(data.id),
        email: data.email,
        name: data.name,
        picture: data.avatar_url,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }
}

interface TwitterUserInfoResponse {
  id_str: string;
  profile_image_url_https: string;
  name: string;
  email?: string;
}

interface TwitterInternalResponse {
  oauth_token: string;
  oauth_token_secret: string;
  user_id?: string;
  screen_name?: string;
}

export class TwitterHandler implements OauthHandler {
  private url: string;
  private oauthToken: string;
  private sigUrl = 'https://oauth.arcana.network/oauth/twitter';
  private oauthTokenSecret: string;
  private oauthUrl = 'https://api.twitter.com/oauth/authorize?oauth_token=';

  constructor(private appID: string) {}

  public async getRequestToken(): Promise<TwitterInternalResponse> {
    const url = new URL(`${this.sigUrl}/${this.appID}/requestToken`);
    const response = await request<TwitterInternalResponse>(url.toString());
    return response;
  }

  public async getAuthUrl(): Promise<string> {
    const params = await this.getRequestToken();
    this.oauthToken = params.oauth_token;
    this.oauthTokenSecret = params.oauth_token;
    if (!this.oauthToken) {
      throw new Error('Error did not have token when expected!');
    }
    return this.oauthUrl + this.oauthToken;
  }
  public async getAccessToken({
    oauth_token,
    oauth_verifier,
  }: {
    oauth_token: string;
    oauth_verifier: string;
  }): Promise<TwitterInternalResponse> {
    if (!oauth_token || !oauth_verifier) {
      throw new Error(`Missing token or verifier`);
    }
    const url = new URL(`${this.sigUrl}/accessToken`);
    url.searchParams.append('oauth_token', oauth_token);
    url.searchParams.append('oauth_verifier', oauth_verifier);
    const response = await request<TwitterInternalResponse>(url.toString());
    return response;
  }

  public async getUserInfo(accessToken: string): Promise<UserInfo> {
    try {
      const url = new URL(`${this.sigUrl}/${this.appID}/user`);
      url.searchParams.append('oauth_token', accessToken);
      url.searchParams.append('oauth_token_secret', this.oauthTokenSecret);
      const data = await request<TwitterUserInfoResponse>(url.toString());
      return {
        id: data.email ? data.email : data.id_str,
        email: data.email,
        name: data.name,
        picture: data.profile_image_url_https,
      };
    } catch (e) {
      return Promise.reject(e);
    }
  }

  public async handleRedirectParams(
    params: RedirectParams
  ): Promise<RedirectParams> {
    if (params.oauth_token && params.oauth_verifier) {
      const oauthTokenVerified = await this.getAccessToken({
        oauth_token: params.oauth_token,
        oauth_verifier: params.oauth_verifier,
      });
      params.access_token = oauthTokenVerified.oauth_token;
      this.oauthTokenSecret = oauthTokenVerified.oauth_token_secret;
      params.id_token = [
        params.access_token,
        this.oauthTokenSecret,
        this.appID,
      ].join(':');
      return { ...params, ...oauthTokenVerified };
    } else {
      return { ...params };
    }
  }
}
