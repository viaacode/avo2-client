import { Avo } from '@viaa/avo2-types';

import { LoginMessage } from '../../authentication/store/types';
import { AppState } from '../../store';
import { selectSearch, selectSearchError, selectSearchLoading, selectSearchResults, } from './selectors';
import { LoginMessage } from '../../authentication/store/types';

describe('search > store > selectors', () => {
	const store: AppState = {
		loginState: {
			data: { message: LoginMessage.LOGGED_IN, userInfo: {} as Avo.User.User },
			loading: false,
			error: false,
		},
		search: {
			data: { results: [], count: 0, aggregations: {} },
			loading: false,
			error: false,
		},
	};

	it('Should get the search tree from the store', () => {
		expect(selectSearch(store)).toMatchObject(store.search);
	});

	it('Should get the search error-state from the store', () => {
		expect(selectSearchError(store)).toEqual(false);
	});

	it('Should get the search loading-state from the store', () => {
		expect(selectSearchLoading(store)).toEqual(false);
	});

	it('Should get the search results from the store', () => {
		expect(selectSearchResults(store)).toMatchObject(store.search.data as any);
	});
});
