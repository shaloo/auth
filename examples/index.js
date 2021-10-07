const googleLoginBtn = document.getElementById('google-login');
console.log({ window });
const { AuthProvider } = window.arcana_login;

const arcanaLogin = new AuthProvider({
  loginType: 'twitter',
  appAddress: '0xbc376e1127C420867272c5Bc56C50e443F5cA5c0',
  clientId: 'IjTXO5J4JkyjBzxsyQvLXbriG',
  redirectUri: 'http://localhost:9001/examples/redirect',
});
const doGoogleLogin = async () => {
  const pk = await arcanaLogin.signIn();
  console.log({ pk });
};

googleLoginBtn.addEventListener('click', () => {
  doGoogleLogin();
});

const checkLogin = async () => {
  const isLoggedIn = arcanaLogin.isLoggedIn();
  if (isLoggedIn) {
    const pk = await arcanaLogin.signIn();
    console.log({ pk });
  }
};

checkLogin();
