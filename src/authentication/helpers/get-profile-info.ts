import { get } from 'lodash-es';
import { AnyAction, Reducer } from 'redux';
import store, { AppState } from '../../store';

import { Avo } from '@viaa/avo2-types';

import { getFullName } from '../../shared/helpers';
import { LoginMessage } from '../store/types';

/**
 * Avoid using this function outside of secureRoutes like in the navbar
 * Since it will be an outdated version that is stored in the store at the time the navbar loads
 *
 * Prefer connect() your component to the loginState store
 * so you can pass the latest version on the userState to these functions
 */
function getUserInfo(userState?: Avo.Auth.LoginResponse): Avo.User.User | null {
	if (userState && userState.userInfo) {
		return userState.userInfo;
	}
	const state: Reducer<AppState, AnyAction> = store.getState();
	return get(state, 'loginState.data.userInfo', null);
}

export const getFirstName = (userState?: Avo.Auth.LoginResponse, defaultName = ''): string => {
	return get(getUserInfo(userState), 'first_name') || defaultName;
};

export const getLastName = (userState?: Avo.Auth.LoginResponse, defaultName = ''): string => {
	return get(getUserInfo(userState), 'last_name') || defaultName;
};

export function getProfileId(userState?: Avo.Auth.LoginResponse): string {
	const profileId = get(getUserInfo(userState), 'profile.id');
	if (!profileId) {
		throw new Error('No profile id could be found for the logged in user');
	}
	return profileId;
}

export function getProfileName(userState?: Avo.Auth.LoginResponse): string {
	const profileName = getFullName(getUserInfo(userState));
	if (!profileName) {
		throw new Error('No profile id could be found for the logged in user');
	}
	return profileName;
}

export function getProfileInitials(userState?: Avo.Auth.LoginResponse): string {
	return getFirstName(userState, 'X')[0] + getLastName(userState, 'X')[0];
}

export function getProfileStamboekNumber(userState?: Avo.Auth.LoginResponse): string | null {
	return get(getUserInfo(userState), 'user.profile.stamboek');
}

export function isProfileComplete(userState?: Avo.Auth.LoginResponse): boolean {
	const profile = get(getUserInfo(userState), 'profile');
	if (!profile) {
		return false;
	}
	return false; // TODO implement check based on user role
}

export function isLoggedIn(loginMessage?: LoginMessage): boolean {
	let message: LoginMessage | undefined = loginMessage;
	if (!message) {
		const state: any = store.getState();
		message = get(state, 'loginState.data.message');
	}

	// TODO add once we can save profile info
	return !!message && message === LoginMessage.LOGGED_IN; // && isProfileComplete();
}
