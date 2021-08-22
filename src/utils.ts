import { LoginType } from './types';
import {
  GoogleInfo,
  TwitchInfo,
  DiscordInfo,
  RedditInfo,
  OauthInfoFetcher,
} from './oauth';

export function getInfoHandler(
  loginType: LoginType,
  clientId = ''
): OauthInfoFetcher {
  switch (loginType) {
    case LoginType.Google: {
      return new GoogleInfo();
    }
    case LoginType.Twitch: {
      return new TwitchInfo(clientId);
    }
    case LoginType.Discord: {
      return new DiscordInfo();
    }
    case LoginType.Reddit: {
      return new RedditInfo();
    }
  }
}

export const parseHash = (url: URL): { [key: string]: string } => {
  const searchParams = new URLSearchParams(url.hash.substring(1));
  const params: { [key: string]: string } = {};
  searchParams.forEach((val: string, key: string) => {
    params[key] = val;
  });
  return params;
};

export const handleRedirectPage = (
  location: Location = window.location
): void => {
  const params = parseHash(new URL(location.href));
  const returnParams = { status: 'success', params };
  window.opener?.postMessage(returnParams, '*');
  return;
};
