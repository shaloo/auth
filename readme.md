# Arcana Auth
Arcana SDK to perform logins on your app.

## Installation

### Using NPM/Yarn

```sh
npm install --save @arcana/auth
yarn add @arcana/auth
```

### Using built source

```html
<script src="<path-to>/auth.js"></script>
```

## Usage

### Initialise the SDK

```js
const { AuthProvider } = window.arcana.auth;
// or
import { AuthProvider } from '@arcana/auth';

const auth = await AuthProvider.init({
   appID: <appID>,
   network: 'testnet', // 'test' or 'testnet'
   uxMode: 'redirect' // 'popup' or 'redirect'
   redirectUri:'' // Can be ignored for redirect flow
});
```

### On redirect Page for popup flow

```js
const { AuthProvider } = window.arcana.auth;
// or
import { AuthProvider } from '@arcana/auth';

window.onload = async () => {
  AuthProvider.handleRedirectPage(<origin>);
};
```

### Initiate login

```js
const { SocialLoginType } = window.arcana.auth;
// or
import { SocialLoginType } from '@arcana/auth';

await auth.loginWithSocial(SocialLoginType.google);
```

### Get user info

```js
const userInfo = auth.getUserInfo();
/* 
  UserInfo: {
    loginType: 'google',
    userInfo: {
      id: 'abc@example.com',
      name: 'ABC DEF',
      email: '',
      picture: ''
    },
    privateKey: ''
  }
*/
```

### Get public key

```js
const { X, Y } = await auth.getPublicKey({
  verifier: <loginType>,
  id: <email | username>,
});
```

### Check if user already logged in
```js
const loggedIn = auth.isLoggedIn();
if (!loggedIn) {
  await auth.loginWithSocial(SocialLoginType.google);
}
const userInfo = auth.getUserInfo()
```

### Clear login session

```js
await auth.logout();
```

### Variables

* `SocialLoginType` - discord, twitter, github, google, twitch, reddit
* `origin` - Base url of your app. 