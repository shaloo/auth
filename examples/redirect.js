const { AuthProvider } = window.arcana.auth;

window.onload = () => {
  AuthProvider.handleRedirectPage('http://localhost:9001');
};
