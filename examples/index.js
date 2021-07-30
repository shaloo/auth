const googleLoginBtn = document.getElementById('google-login')
console.log({ window })

const { ArcanaLogin } = window.arcana_login;

googleLoginBtn.addEventListener('click', () => {
    doGoogleLogin()
})

const doGoogleLogin = async () => {
    const arcanaLogin = new ArcanaLogin({
        loginType: "google",
        verifierId: "google",
        clientId: "513082799772-5f9djcvtjgqvlngr9hndmnm0r372qn89.apps.googleusercontent.com",
        redirectUri: "http://localhost:3000/redirect",
    })

    const pk = await arcanaLogin.doLogin();
    console.log({ pk });
}