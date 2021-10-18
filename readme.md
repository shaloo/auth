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
<script src="<path-to>/arcana-login.js"></script>
```

### Initialise the SDK

```js
const { AuthProvider } = window.arcana_login;
// import { AuthProvider } from '@arcana_tech/arcana-login';

const arcanaAuth = new AuthProvider({
   appID: <appID>,
   oauthCreds: [{
    type: 'google',
    clientID: '',
    redirectUrl: ''
   },
   {
    type: 'twitter',
    clientID: '',
    redirectUrl: ''
   },
   {
    type: 'github',
    clientID: '',
    redirectUrl: ''
   },
   {
    type: 'discord',
    clientID: '',
    redirectUrl: ''
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

### Initiate login and get private key

```js
const pk = await arcanaAuth.signIn(<loginType>);
```

### Get user info

```js
const userInfo = await arcanaAuth.getUserInfo(<loginType>);
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
const isLoggedIn = await arcanaAuth.isLoggedIn(<loginType>)
if (isLoggedIn) {
	const pk = await arcanaAuth.signIn(<loginType>)
	// this wont go through the login flow again
	const userInfo = await arcanaAuth.getUserInfo(<loginType>)
}

// To clear login session
arcanaAuth.clearSession()

```
