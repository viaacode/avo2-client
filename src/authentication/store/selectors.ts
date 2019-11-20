import { get } from 'lodash-es';

import { AppState } from '../../store';

export const selectLogin = ({ loginState }: AppState) => {
	return get(loginState, ['data']);
};

export const selectLoginLoading = ({ loginState }: AppState) => {
	return get(loginState, ['loading']);
};

export const selectLoginError = ({ loginState }: AppState) => {
	return get(loginState, ['error']);
};
