/** * @jest-environment ./tests/setupEnv.js */

import SessionStore, { split, join } from '../src/sessionStore';

describe('Session store split/join', () => {
  test('Split / Join isomorphism', () => {
    const expected = 'Hello, World !';
    const [a, b] = split(expected);
    const received = join(a, b);
    expect(received).toEqual(expected);
  });
});

describe('Session store', () => {
  const store = new SessionStore('');
  test('should have default name/session-key', () => {
    expect(store['name']).toEqual('default');
    expect(store['sessionKey']).toEqual('session-keystore-default');
  });
  test('should have expected name/sesssion key when specified', () => {
    const store = new SessionStore('test');
    expect(store['name']).toEqual('test');
    expect(store['sessionKey']).toEqual('session-keystore-test');
  });
  test('should get stored value', () => {
    store.set('k', 'some_value');
    const val = store.get('k');
    expect(val).toEqual('some_value');
  });
  test('should not get expired value', () => {
    store.set('k', 'some_value', 0);
    const val = store.get('k');
    expect(val).toEqual(null);
  });
  test('should not get deleted value', () => {
    store.set('k', 'some_value');
    const val = store.get('k');
    expect(val).toEqual('some_value');
    store.delete('k');
    expect(store.get('k')).toEqual(null);
  });

  test('should persist values on same window', () => {
    const storeA = new SessionStore();
    storeA.set('foo', 'bar');
    storeA[`persist`]();
    const storeB = new SessionStore();
    expect(storeB.get('foo')).toEqual('bar');
  });
});
