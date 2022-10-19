import { createMemoryHistory } from 'history';
import { RouteComponentProps } from 'react-router-dom';

import { NavigationParams } from '../components/Navigation/Navigation';

/**
 * This is to mock out the dependencies for react router
 */
export function getMockRouterProps(data: any) {
	const location = {
		hash: '',
		key: '',
		pathname: '',
		search: '',
		state: {},
	};

	const props: NavigationParams = {
		location,
		match: {
			isExact: true,
			params: data,
			path: '',
			url: '',
		},
		history: createMemoryHistory() as unknown as RouteComponentProps['history'],
		staticContext: {},
		loginState: {} as any,
		loginStateLoading: false,
		loginStateError: false,
		getLoginState: () => ({} as any),
	};

	return props;
}
