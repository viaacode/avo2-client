import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { getFullName, getInitialChar, getInitials } from '../../shared/helpers';
import store from '../../store';

function getUserInfo(): Avo.User.User | null {
	const state: any = store.getState();
	return get(state, 'loginState.data.userInfo');
}

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
		get(userInfo, 'user.first_name', 'X')[0] +
		getInitialChar(get(userInfo, 'user.last_name', 'X'))[0]
	);
}
