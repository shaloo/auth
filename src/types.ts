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

export interface Store {
  set(key: string, value: string, expiresAt?: Date | number): void;
  get(key: string): string | null;
  delete(key: string): void;
  clear(): void;
}
