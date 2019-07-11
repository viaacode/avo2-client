import Register from './views/Register';
import SignIn from './views/SignIn';

export const AUTHENTICATION_ROUTES = [
	{
		path: '/authentication/sign-in',
		exact: true,
		component: SignIn,
	},
	{
		path: '/authentication/register',
		exact: true,
		component: Register,
	},
];
