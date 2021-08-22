console.log(window.arcana_login);
const {ArcanaLogin} = window.arcana_login;

window.onload = () => {
  ArcanaLogin.handleRedirectPage();
};
