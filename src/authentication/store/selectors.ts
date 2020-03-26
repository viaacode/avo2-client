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

export const selectUser = ({ loginState }: AppState) => {
	return get(loginState, ['data', 'userInfo']);
};

export const selectLoginMessage = ({ loginState }: AppState) => {
	return get(loginState, ['data', 'message']);
};

export const selectAcceptedConditions = ({ loginState }: AppState) => {
	return get(loginState, ['data', 'acceptedConditions']);
};
