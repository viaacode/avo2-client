import { type Avo } from '@viaa/avo2-types';
import { type LoginResponseLoggedInSchema } from '@viaa/avo2-types/types/auth';
import { atom } from 'jotai';
import { selectAtom } from 'jotai/utils';

import { type LoginState } from './authentication.types';

export const loginAtom = atom<LoginState>({
	data: null,
	loading: false,
	error: false,
});

export const commonUserAtom = selectAtom(
	loginAtom,
	(loginState) => (loginState.data as LoginResponseLoggedInSchema)?.commonUserInfo
);

/**
 * @deprecated please use commonUserAtom instead
 */
export const userAtom = selectAtom(
	loginAtom,
	(loginState) => (loginState.data as LoginResponseLoggedInSchema)?.userInfo
);

export const acceptConditionsAtom = atom<boolean | null, [], void>(null, (get, set) => {
	const newLoginState = {
		...get(loginAtom),
		data: {
			...(get(loginAtom).data as Avo.Auth.LoginResponse),
			acceptedConditions: true,
		},
	};
	set(loginAtom, newLoginState);
});
