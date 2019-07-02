import { get } from 'lodash-es';

import { SearchState } from './types';

const getSearch = ({ search }: { search: SearchState }) => {
	return search;
};

const getSearchResults = ({ search }: { search: SearchState }) => {
	return get(search, ['result']);
};

const getSearchLoading = ({ search }: { search: SearchState }) => {
	return get(search, ['loading']);
};

const getSearchError = ({ search }: { search: SearchState }) => {
	return get(search, ['error']);
};

export { getSearch, getSearchResults, getSearchLoading, getSearchError };
