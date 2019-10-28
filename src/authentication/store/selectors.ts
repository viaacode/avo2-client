import { get } from 'lodash-es';

import { LoginState } from './types';

const selectLogin = ({ loginState }: { loginState: LoginState }) => {
	return get(loginState, ['data']);
};

const selectLoginLoading = ({ loginState }: { loginState: LoginState }) => {
	return get(loginState, ['loading']);
};

const selectLoginError = ({ loginState }: { loginState: LoginState }) => {
	return get(loginState, ['error']);
};

export { selectLogin, selectLoginLoading, selectLoginError };
