import { get } from 'lodash-es';

import { SearchState } from './types';

const selectSearch = ({ search }: { search: SearchState }) => {
	return search;
};

const selectSearchResults = ({ search }: { search: SearchState }) => {
	return get(search, ['data']);
};

const selectSearchLoading = ({ search }: { search: SearchState }) => {
	return get(search, ['loading']);
};

const selectSearchError = ({ search }: { search: SearchState }) => {
	return get(search, ['error']);
};

export { selectSearch, selectSearchResults, selectSearchLoading, selectSearchError };
