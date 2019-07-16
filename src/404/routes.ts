import NotFound from './views/NotFound';

export const NOT_FOUND_ROUTES = [
	{
		path: '*',
		exact: true,
		component: NotFound,
	},
];
