import ApolloClient from 'apollo-boost';

import { CustomWindow } from '../types/CustomWindow';

export const dataService = new ApolloClient({
	uri: `${(window as CustomWindow)._ENV_.PROXY_URL}/data`,
});
