import { get } from 'lodash-es';

import { LoginState } from './types';

const selectLogin = (store: any) => {
	console.log('selector loginState triggered: ', store);
	return get(store.loginState, ['data']);
};

const selectLoginLoading = ({ loginState }: { loginState: LoginState }) => {
	console.log('selector loginStateLoading triggered: ', loginState);
	return get(loginState, ['loading']);
};

const selectLoginError = ({ loginState }: { loginState: LoginState }) => {
	console.log('selector loginStateError triggered: ', loginState);
	return get(loginState, ['error']);
};

export { selectLogin, selectLoginLoading, selectLoginError };
