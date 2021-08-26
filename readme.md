# Arcana Login

Arcana SDK to perform social logins on your app.

## Introduction

## Usage

### Add to index.html

```html
<script src="../dist_bundle/arcana_login.js"></script>
```

### Create button

```html
<button id="google-login">Continue with google</button>
```

### Attach handler

```js
const googleLoginBtn = document.getElementById('google-login');

googleLoginBtn.addEventListener('click', () => {
  // Initialize SDK
  // Get pvt key
});
```

### Initialize the SDK

```js
const { ArcanaLogin } = window.arcana_login;

const arcanaLogin = new ArcanaLogin({
   loginType: "google", // discord, google, reddit and twitch
   appAddress: "<verifier_address>",
   clientId: "513082793372-5f9ejcvtjggadasdasndmnm0r372qn89.apps.googleusercontent.com",
   redirectUri: <redirectUri>,
})

```

### On redirect Page

```js
const { ArcanaLogin } = window.arcana_login;

window.onload = () => {
  ArcanaLogin.handleRedirectPage();
};
```

### Initiate login and get private key

```js
const pk = await arcanaLogin.go();
```

### Get user info

```js
const userInfo = await arcanaLogin.getUserInfo();
```
