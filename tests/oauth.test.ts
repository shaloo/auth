import { LoginType } from '../src/types';
import {
  getOauthLoginUrl,
  GoogleInfo,
  RedditInfo,
  DiscordInfo,
  TwitchInfo,
} from '../src/oauth';

describe('getOauthLogin', () => {
  test('returns expected login url', () => {
    const url = getOauthLoginUrl({
      loginType: LoginType.Google,
      redirectUri: 'https://app.test.network',
      clientId: 'clientid-google.app.com',
      state: '1absy16200',
    });
    expect(url).toBe(
      'https://accounts.google.com/o/oauth2/v2/auth?client_id=clientid-google.app.com&redirect_uri=https%3A%2F%2Fapp.test.network&state=1absy16200&response_type=token+id_token&scope=profile+email+openid&prompt=consent+select_account&nonce=test'
    );
  });
});

const getMockRequest = (value: any) => {
  return jest.fn().mockResolvedValue(value);
};

describe('GoogleInfo', () => {
  test('returns expected user info', async () => {
    const gh = new GoogleInfo();
    const email = 'foo@bar.com';
    const request = getMockRequest({ email });
    const res = await gh.getUserInfo('test_access_token', request);
    expect(request).toHaveBeenCalled();
    expect(res.id).toBe(email);
  });
});
describe('RedditInfo', () => {
  test('returns expected user info', async () => {
    const gh = new RedditInfo();
    const name = '/u/qwertyuiop';
    const request = getMockRequest({ name });
    const res = await gh.getUserInfo('test_access_token', request);
    expect(request).toHaveBeenCalled();
    expect(res.id).toBe(name);
  });
});
describe('TwitchInfo', () => {
  test('returns expected user info', async () => {
    const gh = new TwitchInfo('clientId');
    const id = 'foo@bar.com';
    const request = getMockRequest({ data: [{ id }] });
    const res = await gh.getUserInfo('test_access_token', request);
    expect(request).toHaveBeenCalled();
    expect(res.id).toBe(id);
  });
});
describe('DiscordInfo', () => {
  test('returns expected user info', async () => {
    const gh = new DiscordInfo();
    const id = 'foo@bar.com';
    const request = getMockRequest({ user: { id } });
    const res = await gh.getUserInfo('test_access_token', request);
    expect(request).toHaveBeenCalled();
    expect(res.id).toBe(id);
  });
});
