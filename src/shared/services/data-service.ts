import ApolloClient from 'apollo-boost';
import { getEnv } from '../helpers/env';

export const dataService = new ApolloClient({
	uri: `${getEnv('PROXY_URL')}/data`,
	credentials: 'include',
});
