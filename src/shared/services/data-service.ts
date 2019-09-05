import ApolloClient from 'apollo-boost';

export const dataService = new ApolloClient({
	uri: `${window._ENV_.PROXY_URL}/data`,
});
