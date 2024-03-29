export enum LoginType {
  google = 'google',
  reddit = 'reddit',
  discord = 'discord',
  twitch = 'twitch',
  github = 'github',
  twitter = 'twitter',
}

export interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}

export interface StoredUserInfo {
  loginType: LoginType;
  userInfo: UserInfo;
  privateKey: string;
}

export interface InitParams {
  appID: string;
  redirectUri?: string;
  network?: 'test' | 'testnet';
  rpcUrl?: string;
  flow?: 'popup' | 'redirect';
}

export interface StateParams {
  appID: string;
  redirectUri: string;
  network: 'test' | 'testnet';
  rpcUrl?: string;
  flow: 'popup' | 'redirect';
}

export enum StoreIndex {
  LOGGED_IN = 'arc.user',
  LOGIN_TYPE = 'login_type',
  STATE = 'state',
}

export interface Store {
  set(key: string, value: string, expiresAt?: Date | number): void;
  get(key: string): string | null;
  delete(key: string): void;
  clear(): void;
}

export interface OAuthFetcher {
  getClientID(loginType: LoginType): Promise<string>;
  getLogins(): Promise<string[]>;
}
