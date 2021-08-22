export enum LoginType {
  Google = 'google',
  Reddit = 'reddit',
  Discord = 'discord',
  Twitch = 'twitch',
}

export interface UserInfo {
  id: string;
  email?: string;
  name?: string;
}
