import { type Avo } from '@viaa/avo2-types';
import { type LoginResponseLoggedInSchema } from '@viaa/avo2-types/types/auth';
import { atom } from 'jotai';

import { type LoginState } from './store.types';

export const loginAtom = atom<LoginState>({
	data: null,
	loading: false,
	error: false,
});

export const commonUserAtom = atom<Avo.User.CommonUser>((get) => {
	return (get(loginAtom).data as LoginResponseLoggedInSchema)?.commonUserInfo;
});

/**
 * @deprecated please use commonUserAtom instead
 */
export const userAtom = atom<Avo.User.User>((get) => {
	return (get(loginAtom).data as LoginResponseLoggedInSchema)?.userInfo;
});

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
