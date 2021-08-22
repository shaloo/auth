import { getInfoHandler, parseHash } from '../src/utils';
import { LoginType } from '../src/types';
import { DiscordInfo, GoogleInfo, RedditInfo, TwitchInfo } from '../src/oauth';

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
    const gh = getInfoHandler(LoginType.Google);
    expect(gh instanceof GoogleInfo).toBe(true);
    const dh = getInfoHandler(LoginType.Discord);
    expect(dh instanceof DiscordInfo).toBe(true);
    const rh = getInfoHandler(LoginType.Reddit);
    expect(rh instanceof RedditInfo).toBe(true);
    const th = getInfoHandler(LoginType.Twitch);
    expect(th instanceof TwitchInfo).toBe(true);
  });
});
