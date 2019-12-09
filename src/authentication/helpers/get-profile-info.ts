import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { getFullName } from '../../shared/helpers';
import store from '../../store';
import { LoginMessage } from '../store/types';

function getUserInfo(): Avo.User.User | null {
	const state: any = store.getState();
	return get(state, 'loginState.data.userInfo');
}

export const getFirstName = () => {
	const state: any = store.getState();
	return get(state, 'loginState.data.userInfo.first_name');
};

export function getProfileId(): string {
	const userInfo = getUserInfo();
	const profileId = get(userInfo, 'profile.id');
	if (!profileId) {
		throw new Error('No profile id could be found for the logged in user');
	}
	return profileId;
}

export function getProfileName(): string {
	const userInfo = getUserInfo();
	const profileName = getFullName(userInfo);
	if (!profileName) {
		throw new Error('No profile id could be found for the logged in user');
	}
	return profileName;
}

export function getProfileInitials(): string {
	const userInfo = getUserInfo();
	return (
		(get(userInfo, 'first_name', 'X') as string)[0] + (get(userInfo, 'last_name', 'X') as string)[0]
	);
}

export function getProfileStamboekNumber(): string | null {
	const userInfo = getUserInfo();
	return get(userInfo, 'user.profile.stamboek');
}

export function isProfileComplete(): boolean {
	const userInfo = getUserInfo();
	const profile = get(userInfo, 'profile');
	if (!profile) {
		return false;
	}
	return false; // TODO implement check based on user role
}

export function isLoggedIn(): boolean {
	const state: any = store.getState();
	const loggedInMessage: LoginMessage = get(state, 'loginState.data.message');

	// TODO add once we can save profile info
	return loggedInMessage && loggedInMessage === LoginMessage.LOGGED_IN; // && isProfileComplete();
}
