import { LoginType } from './types';
import {
  OauthHandler,
  GoogleHandler,
  TwitchHandler,
  DiscordHandler,
  RedditHandler,
  GithubHandler,
  TwitterHandler,
} from './oauth';

export function getLoginHandler(
  loginType: LoginType,
  appID: string
): OauthHandler {
  switch (loginType) {
    case LoginType.Google: {
      return new GoogleHandler(appID);
    }
    case LoginType.Twitch: {
      return new TwitchHandler(appID);
    }
    case LoginType.Discord: {
      return new DiscordHandler(appID);
    }
    case LoginType.Reddit: {
      return new RedditHandler(appID);
    }
    case LoginType.Github: {
      return new GithubHandler(appID);
    }
    case LoginType.Twitter: {
      return new TwitterHandler(appID);
    }
  }
}

export const parseHash = (url: URL): RedirectParams => {
  let params: RedirectParams = {};
  const queryParams = url.searchParams;
  const hashParams = new URLSearchParams(url.hash.substring(1));
  for (const key in RedirectParamsList) {
    let val = hashParams.get(key);
    if (!val) {
      val = queryParams.get(key);
    }
    if (val) {
      params = { ...params, [key]: val };
    }
  }
  return params;
};

enum RedirectParamsList {
  state = 'state',
  access_token = 'access_token',
  error = 'error',
  error_uri = 'error_uri',
  error_description = 'error_description',
  id_token = 'id_token',
  token_type = 'token_type',
  scope = 'scope',
  expires_in = 'expires_in',
  code = 'code',
  oauth_token = 'oauth_token',
  oauth_token_secret = 'oauth_token_secret',
  oauth_verifier = 'oauth_verifier',
}

export type RedirectParams = { [key in RedirectParamsList]?: string };

export interface RedirectResponse {
  status: 'success' | 'error';
  error?: string;
  params: RedirectParams;
}
export const handleRedirectPage = (origin = '*'): void => {
  try {
    parseAndSendRedirectParams(window.location, origin);
  } catch (error) {
    console.log({ error });
  }
};

export const parseAndSendRedirectParams = (
  location: Location,
  origin: string
): void => {
  const params = parseHash(new URL(location.href));
  const returnParams: RedirectResponse = { status: 'success', params };
  if (params.error) {
    returnParams.status = 'error';
    returnParams.error = params.error;
  }
  window.opener?.postMessage(returnParams, origin);
  return;
};

export const generateID = (): string => {
  return (
    '_' +
    Math.random()
      .toString(36)
      .substr(2, 9)
  );
};
