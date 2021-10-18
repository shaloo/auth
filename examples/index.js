const googleLoginBtn = document.getElementById('google-login');
const githubLoginBtn = document.getElementById('github-login');
const twitterLoginBtn = document.getElementById('twitter-login');
const discordLoginBtn = document.getElementById('discord-login');
const twitchLoginBtn = document.getElementById('twitch-login');
const redditLoginBtn = document.getElementById('reddit-login');
const { AuthProvider } = window.arcana_login;

const arcanaLogin = new AuthProvider({
  appID: '0x73A15a259d1bB5ACC23319CCE876a976a278bE82',
  oauthCreds: [
    {
      type: 'twitter',
      clientId: 'random',
      redirectUri: 'http://localhost:9001/examples/redirect',
    },
    {
      type: 'google',
      clientId:
        '513082799772-5f9djcvtjgqvlngr9hndmnm0r372qn89.apps.googleusercontent.com',
      redirectUri: 'http://localhost:9001/examples/redirect',
    },
    {
      type: 'github',
      clientId: '6b9678c150ab952b8172',
      redirectUri: 'http://localhost:9001/examples/redirect',
    },
    {
      type: 'reddit',
      clientId: 'XqDPdItJRX6DEA',
      redirectUri: 'http://localhost:9001/examples/redirect',
    },
    {
      type: 'twitch',
      clientId: 'f0779afn8hwttvks1acwq1q2a09o5x',
      redirectUri: 'http://localhost:9001/examples/redirect',
    },
    {
      type: 'discord',
      clientId: '850208521937092618',
      redirectUri: 'http://localhost:9001/examples/redirect',
    },
  ],
});
const login = async (verifier) => {
  const pk = await arcanaLogin.signIn(verifier);
  console.log({ pk });
  const info = await arcanaLogin.getUserInfo(verifier);
  console.log({ info });
  setUserInfo(info.id, pk.privateKey, verifier);
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
