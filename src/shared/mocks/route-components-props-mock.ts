import { Href, UnregisterCallback } from 'history';
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
		match: {
			isExact: true,
			params: data,
			path: '',
			url: '',
		},
		location,
		history: {
			length: 2,
			action: 'POP',
			location,
			push: () => {},
			replace: () => {},
			go: num => {},
			goBack: () => {},
			goForward: () => {},
			block: t => {
				return (null as unknown) as UnregisterCallback;
			},
			createHref: t => {
				const temp: Href = '';
				return temp;
			},
			listen: t => {
				return (null as unknown) as UnregisterCallback;
			},
		},
		staticContext: {},
	};

	return props;
}
