# Arcana Login

SDK to perform login on your app.

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
const googleLoginBtn = document.getElementById('google-login')

googleLoginBtn.addEventListener('click', () => {
    // Initialize SDK
    // Get pvt key
})

```


### Initialize

```js
const { ArcanaLogin } = window.arcana_login;

const arcanaLogin = new ArcanaLogin({
   loginType: "google", // discord, google, reddit and twitch
   verifierId: "<verifier_address>",
   clientId: "513082793372-5f9ejcvtjgqvlngr9hndmnm0r372qn89.apps.googleusercontent.com",
   redirectUri: <redirectUri>,
})

```

### Get private key

```js
const pk = await arcanaLogin.doLogin();
```