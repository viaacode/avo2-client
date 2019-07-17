import SecuredRoute from '../authentication/components/SecuredRoute';
import Search from './views/Search';

export const SEARCH_ROUTES = [
	{
		path: '/search',
		exact: true,
		component: new SecuredRoute({ component: Search, path: '/search' }),
	},
];
