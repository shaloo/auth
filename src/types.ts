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
