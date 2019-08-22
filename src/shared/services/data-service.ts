import ApolloClient from 'apollo-boost';

export const dataService = new ApolloClient({
	uri: `${process.env.REACT_APP_PROXY_URL}/data`,
});
