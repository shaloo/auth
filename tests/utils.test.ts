import { getLoginHandler, parseHash } from '../src/utils';
import { LoginType } from '../src/types';
import {
  DiscordHandler,
  GithubHandler,
  GoogleHandler,
  RedditHandler,
  TwitchHandler,
  TwitterHandler,
} from '../src/oauth';

describe('parseHash', () => {
  test('returns expected hash params from url', () => {
    const url = new URL(
      'http://localhost:8080/examples/redirect#state=_jf5too8sv&access_token=some_access_token&token_type=Bearer&expires_in=3599&scope=email%20profile%20openid&id_token=some_id_token&authuser=0&hd=newfang.io&prompt=consent'
    );
    const params = parseHash(url);
    expect(params.state).toBe('_jf5too8sv');
    expect(params.token_type).toBe('Bearer');
    expect(params.expires_in).toBe('3599');
    expect(params.id_token).toBe('some_id_token');
    expect(params.scope).toBe('email profile openid');
    expect(params.access_token).toBe('some_access_token');
  });
});

describe('getInfoHandler', () => {
  test('returns correct handler depending on login type', () => {
    const gh = getLoginHandler(LoginType.Google, '');
    expect(gh instanceof GoogleHandler).toBe(true);
    const dh = getLoginHandler(LoginType.Discord, '');
    expect(dh instanceof DiscordHandler).toBe(true);
    const rh = getLoginHandler(LoginType.Reddit, '');
    expect(rh instanceof RedditHandler).toBe(true);
    const th = getLoginHandler(LoginType.Twitch, '');
    expect(th instanceof TwitchHandler).toBe(true);
    const twh = getLoginHandler(LoginType.Twitter, '');
    expect(twh instanceof TwitterHandler).toBe(true);
    const gih = getLoginHandler(LoginType.Github, '');
    expect(gih instanceof GithubHandler).toBe(true);
  });
});
