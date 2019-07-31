import { selectLogin, selectLoginError, selectLoginLoading } from './selectors';
import { LoginResponse, LoginState } from './types';

describe('login > store > selectors', () => {
	const store = {
		loginState: {
			data: { message: 'LOGGED_IN' } as LoginResponse,
			loading: false,
			error: false,
		},
	};

	it('Should get the login error-state from the store', () => {
		expect(selectLoginError(store)).toEqual(false);
	});

	it('Should get the login loading-state from the store', () => {
		expect(selectLoginLoading(store)).toEqual(false);
	});

	it('Should get the login data from the store', () => {
		expect(selectLogin(store)).toMatchObject(store.loginState.data);
	});
});
