import { get } from 'lodash-es';

import { getFullName } from '../../shared/helpers';
import store from '../../store';

function getUserInfo() {
	const state: any = store.getState();
	return get(state, 'loginState.data.userInfo');
}

export function getLogoutPath(): string | undefined {
	const state: any = store.getState();
	return get(state, 'loginState.data.logoutPath');
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
