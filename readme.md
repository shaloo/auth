# Arcana Login
Arcana SDK to perform social logins on your app.

## Installation

### Using NPM/Yarn

```sh
npm install --save @arcana_tech/arcana-login
yarn add @arcana_tech/arcana-login
```


### Using built source

```html
<script src="<path-to>/arcana_login.js"></script>
```

### Initialise the SDK

```js
const { AuthProvider } = window.arcana_login;
// import { AuthProvider } from '@arcana-tech/arcana-login';

const arcanaAuth = new AuthProvider({
   appID: <appID>,
   redirectUri:'',
   oauthCreds: [{
    type: 'google',
    clientID: '',
   },
   {
    type: 'twitter',
    clientID: '',
   },
   {
    type: 'github',
    clientID: '',
   },
   {
    type: 'discord',
    clientID: '',
   }]
})

```

### On redirect Page

```js
const { AuthProvider } = window.arcana_login;

window.onload = () => {
  AuthProvider.handleRedirectPage(<origin>);
};
```

### Initiate login

```js
await arcanaAuth.login(<loginType>);
```

### Get user info

```js
const userInfo = arcanaAuth.getUserInfo();
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
const userInfo = await arcanaAuth.getPublicKey({
  verifier: <loginType>,
  id: <email | username>,
});
```

### Check if user already logged in
```js
const loggedIn = arcanaAuth.isLoggedIn();
if (!loggedIn) {
  await arcanaAuth.login(<loginType>);
}
const userInfo = arcanaAuth.getUserInfo()
```

### Clear login session

```js
await arcanaAuth.logout();
```

### Variables

* `loginType` - discord, twitter, github, google, twitch, reddit
* `origin` - Base url of your app. 