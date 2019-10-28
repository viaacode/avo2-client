import { get } from 'lodash-es';

import { AppState } from '../../store';

const selectSearch = ({ search }: AppState) => {
	return search;
};

const selectSearchResults = ({ search }: AppState) => {
	return get(search, ['data']);
};

const selectSearchLoading = ({ search }: AppState) => {
	return get(search, ['loading']);
};

const selectSearchError = ({ search }: AppState) => {
	return get(search, ['error']);
};

export { selectSearch, selectSearchResults, selectSearchLoading, selectSearchError };
