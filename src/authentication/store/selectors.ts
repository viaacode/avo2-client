import { get } from 'lodash-es';

import { AppState } from '../../store';

const selectLogin = ({ loginState }: AppState) => {
	return get(loginState, ['data']);
};

const selectLoginLoading = ({ loginState }: AppState) => {
	return get(loginState, ['loading']);
};

const selectLoginError = ({ loginState }: AppState) => {
	return get(loginState, ['error']);
};

export { selectLogin, selectLoginLoading, selectLoginError };
