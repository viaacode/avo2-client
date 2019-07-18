import {
	selectCheckLoginState,
	selectCheckLoginStateError,
	selectCheckLoginStateLoading,
} from './selectors';
import { CheckLoginStateResponse } from './types';

describe('checkLoginState > store > selectors', () => {
	const store = {
		checkLoginState: {
			data: { message: 'LOGGED_IN' } as CheckLoginStateResponse,
			loading: false,
			error: false,
		},
	};

	it('Should get the checkLoginState error-state from the store', () => {
		expect(selectCheckLoginStateError(store)).toEqual(false);
	});

	it('Should get the checkLoginState loading-state from the store', () => {
		expect(selectCheckLoginStateLoading(store)).toEqual(false);
	});

	it('Should get the checkLoginState data from the store', () => {
		expect(selectCheckLoginState(store)).toMatchObject(store.checkLoginState.data);
	});
});
