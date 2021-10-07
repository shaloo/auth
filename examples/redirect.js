console.log(window.arcana_login);
const { AuthProvider } = window.arcana_login;

window.onload = () => {
  AuthProvider.handleRedirectPage('http://localhost:9001');
};
