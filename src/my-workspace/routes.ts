import MyWorkspace from './views/MyWorkspace';

export const MY_WORKSPACE_ROUTES = [
	{
		path: '/mijn-werkruimte/:tabId',
		exact: false,
		component: MyWorkspace,
	},
];
