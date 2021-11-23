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

const auth = new AuthProvider({
   appID: <appID>,
   network: 'testnet',
   redirectUri:''
})

```

### On redirect Page

```js
const { AuthProvider } = window.arcana.auth;
// or
import { AuthProvider } from '@arcana/auth';

window.onload = () => {
  AuthProvider.handleRedirectPage(<origin>);
};
```

### Initiate login

```js
await auth.loginWithSocial(<loginType>);
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

### Get public  key

```js
const userInfo = await auth.getPublicKey({
  verifier: <loginType>,
  id: <email | username>,
});
```

### Check if user already logged in
```js
const loggedIn = auth.isLoggedIn();
if (!loggedIn) {
  await auth.loginWithSocial(<loginType>);
}
const userInfo = auth.getUserInfo()
```

### Clear login session

```js
await auth.logout();
```

### Variables

* `loginType` - discord, twitter, github, google, twitch, reddit
* `origin` - Base url of your app. 