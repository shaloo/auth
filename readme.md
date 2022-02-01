# Arcana Auth
Arcana SDK to perform logins on your app.

## Installation

### Using NPM/Yarn

```sh
npm install --save @arcana/auth
yarn add @arcana/auth
```

### Using CDN
```html
<script src="https://cdn.jsdelivr.net/npm/@arcana/auth"></script>
```
```html
<script src="https://unpkg.com/@arcana/auth"></script>
```

## Usage

### Import 

```js
const { AuthProvider, SocialLoginType } = window.arcana.auth;
// or
import { AuthProvider,SocialLoginType } from '@arcana/auth';
```
### Initialise

```js
const auth = await AuthProvider.init({
   appId: `${appId}`,
   network: 'testnet', // 'test' or 'testnet'
   flow: 'redirect', // 'popup' or 'redirect'
   redirectUri:'' // Can be ignored for redirect flow if same as login page
});
```

### Initiate social login

```js
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

## Flow modes

### **Redirect**

`login.js`
```js
window.onload = async () => {
  const auth = await AuthProvider.init({
    appId: `${appId}`,
    network: 'testnet',
    flow: 'redirect',
    redirectUri:'path/to/redirect' 
  });

  googleLoginBtn.addEventListener('click', async () => {
    await auth.loginWithSocial(SocialLoginType.google);
  });
}
```

`redirect.js`
```js
window.onload = async () => {
  const auth = await AuthProvider.init({
    appId: `${appId}`,
    network: 'testnet',
    flow: 'redirect',
    redirectUri:'path/to/redirect' 
  });
  if(auth.isLoggedIn()) {
    const info = auth.getUserInfo();
    // Store info and redirect accordingly
  }
}
```
- Skip `redirectUri` in params if the it is same as login page.

### **Popup**

`login.js`
```js
window.onload = async () => {
  const auth = await AuthProvider.init({
    appId: `${appId}`,
    network: 'testnet',
    flow: 'popup',
    redirectUri:'path/to/redirect' 
  });

  googleLoginBtn.addEventListener('click', async () => {
    await auth.loginWithSocial(SocialLoginType.google);
    if(auth.isLoggedIn()) {
      const info = auth.getUserInfo();
      // Store info and redirect accordingly
    }
  });
}
```

`redirect.js`
```js
window.onload = async () => {
  AuthProvider.handleRedirectPage(<origin>);
};
```
### Variables

* `SocialLoginType` - discord, twitter, github, google, twitch, reddit
* `origin` - Base url of your app. 