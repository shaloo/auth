export enum LoginType {
  Google = 'google',
  Reddit = 'reddit',
  Discord = 'discord',
  Twitch = 'twitch',
  Github = 'github',
  Twitter = 'twitter',
}

export interface UserInfo {
  id: string;
  email?: string;
  name?: string;
  picture?: string;
}
