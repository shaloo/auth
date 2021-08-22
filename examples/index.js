const googleLoginBtn = document.getElementById('google-login');

const { ArcanaLogin } = window.arcana_login;

const doGoogleLogin = async () => {
  const arcanaLogin = new ArcanaLogin({
    loginType: 'google',
    appAddress: '0xc1912fee45d61c87cc5ea59dae31190fffff232d',
    clientId: '513082799772-udwuidnajdkadnjand.apps.googleusercontent.com',
    redirectUri: 'http://localhost:8080/examples/redirect',
  });

  const pk = await arcanaLogin.doLogin();
  console.log({ pk });
};

googleLoginBtn.addEventListener('click', () => {
  doGoogleLogin();
});
