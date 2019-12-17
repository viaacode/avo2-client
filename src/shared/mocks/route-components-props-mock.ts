import { createBrowserHistory, Href, UnregisterCallback } from 'history';
import { RouteComponentProps } from 'react-router';

/**
 * This is to mock out the dependencies for react router
 */
export function getMockRouterProps<P>(data: P) {
	const location = {
		hash: '',
		key: '',
		pathname: '',
		search: '',
		state: {},
	};

	const props: RouteComponentProps<P> = {
		location,
		match: {
			isExact: true,
			params: data,
			path: '',
			url: '',
		},
		history: createBrowserHistory(),
		staticContext: {},
	};

	return props;
}
