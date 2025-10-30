import LoginPage from '../pages/auth/login-page.js';
import RegisterPage from '../pages/auth/register-page.js';
import HomePage from '../pages/home/home-page.js';
import CreatePage from '../pages/create/create-page.js';

const routes = {
  '/': HomePage,
  '/login': LoginPage,
  '/register': RegisterPage,
  '/home': HomePage,
  '/create': CreatePage,
};

export default routes;