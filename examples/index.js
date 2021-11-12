const googleLoginBtn = document.getElementById('google-login');
const githubLoginBtn = document.getElementById('github-login');
const twitterLoginBtn = document.getElementById('twitter-login');
const discordLoginBtn = document.getElementById('discord-login');
const twitchLoginBtn = document.getElementById('twitch-login');
const redditLoginBtn = document.getElementById('reddit-login');
const { AuthProvider } = window.arcana.auth;

const arcanaLogin = new AuthProvider({
  appID: '1',
  redirectUri: 'http://localhost:9001/examples/redirect',
  network: 'test',
  oauthCreds: [
    {
      type: 'google',
      clientId:
        '513082799772-5f9djcvtjgqvlngr9hndmnm0r372qn89.apps.googleusercontent.com',
    },
  ],
});
const login = async (verifier) => {
  await arcanaLogin.loginWithSocial(verifier);
  const info = await arcanaLogin.getUserInfo(verifier);
  setUserInfo(info.userInfo.id, info.privateKey, verifier);
};

githubLoginBtn.addEventListener('click', () => {
  login('github');
});
twitterLoginBtn.addEventListener('click', () => {
  login('twitter');
});
googleLoginBtn.addEventListener('click', () => {
  login('google');
});
discordLoginBtn.addEventListener('click', () => {
  login('discord');
});
twitchLoginBtn.addEventListener('click', () => {
  login('twitch');
});
redditLoginBtn.addEventListener('click', () => {
  login('reddit');
});

const userIDElement = document.getElementById('user-id');
const keyElement = document.getElementById('pvt-key');
const typeElement = document.getElementById('login-type');

const setUserInfo = (id, key, type) => {
  userIDElement.innerText = id;
  keyElement.innerText = key;
  typeElement.innerText = type;
};
// const checkLogin = async () => {
//   const isLoggedIn = arcanaLogin.isLoggedIn('google');
//   if (isLoggedIn) {
//     const pk = await arcanaLogin.signIn('google');
//     console.log({ pk });
//   }
// };

// checkLogin();

// github twitter twitch reddit
