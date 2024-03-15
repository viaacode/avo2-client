import { type Avo } from '@viaa/avo2-types';

import { AppState } from '../../store';

export const selectLogin = ({ loginState }: AppState) => {
	return loginState?.data;
};

export const selectLoginLoading = ({ loginState }: AppState) => {
	return loginState?.loading;
};

export const selectLoginError = ({ loginState }: AppState) => {
	return loginState?.error;
};

export const selectUser = ({ loginState }: AppState) => {
	return (loginState?.data as Avo.Auth.LoginResponseLoggedIn)?.userInfo;
};

export const selectCommonUser = ({ loginState }: AppState) => {
	return (loginState?.data as Avo.Auth.LoginResponseLoggedIn)?.commonUserInfo;
};
