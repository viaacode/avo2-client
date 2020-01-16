import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { getFullName } from '../../shared/helpers';
import { CustomError } from '../../shared/helpers/error';
import store from '../../store';

import { LoginMessage } from '../authentication.types';

export const getFirstName = (user: Avo.User.User | undefined, defaultName = ''): string => {
	if (!user) {
		throw new CustomError('Failed to get user first name because the logged in user is undefined');
	}
	return get(user, 'first_name') || defaultName;
};

export function hasIdpLinked(user: Avo.User.User, idpType: Avo.Auth.IdpType): boolean {
	return get(user, 'idpmaps', [] as Avo.Auth.IdpType[]).includes(idpType);
}

export const getLastName = (user: Avo.User.User | undefined, defaultName = ''): string => {
	if (!user) {
		throw new CustomError('Failed to get user last name because the logged in user is undefined');
	}
	return get(user, 'last_name') || defaultName;
};

export function getProfile(user: Avo.User.User | undefined): Avo.User.Profile {
	if (!user) {
		throw new CustomError('Failed to get profile because the logged in user is undefined');
	}
	const profile = get(user, 'profile');
	if (!profile) {
		throw new CustomError('No profile could be found for the logged in user');
	}
	return profile;
}

export function getProfileId(user: Avo.User.User | undefined): string {
	const userInfo = user || get(store.getState(), 'loginState.data.userInfo', null);
	if (!userInfo) {
		throw new CustomError('Failed to get profile id because the logged in user is undefined');
	}
	const profileId = get(user, 'profile.id');
	if (!profileId) {
		throw new CustomError('No profile id could be found for the logged in user');
	}
	return profileId;
}

export function getProfileName(user: Avo.User.User | undefined): string {
	if (!user) {
		throw new CustomError('Failed to get profile name because the logged in user is undefined');
	}
	const profileName = getFullName(user);
	if (!profileName) {
		throw new CustomError('No profile name could be found for the logged in user');
	}
	return profileName;
}

export function getProfileAlias(user: Avo.User.User | undefined): string {
	if (!user) {
		throw new CustomError('Failed to get profile alias because the logged in user is undefined');
	}
	return get(user, 'profile.alias', '');
}

export function getProfileInitials(user: Avo.User.User | undefined): string {
	if (!user) {
		throw new CustomError('Failed to get profile initials because the logged in user is undefined');
	}
	return getFirstName(user, 'X')[0] + getLastName(user, 'X')[0];
}

export function getProfileStamboekNumber(user: Avo.User.User | undefined): string | null {
	if (!user) {
		throw new CustomError(
			'Failed to get profile stamboek number because the logged in user is undefined'
		);
	}
	return get(user, 'user.profile.stamboek', null);
}

export function isProfileComplete(user: Avo.User.User): boolean {
	const profile = get(user, 'profile');

	// TODO implement check based on user role
	return (
		!!profile &&
		!!profile.organizations &&
		!!profile.organizations.length &&
		!!profile.educationLevels &&
		!!profile.educationLevels.length &&
		!!profile.subjects &&
		!!profile.subjects.length
	);
}

export function isLoggedIn(
	loginMessage: Avo.Auth.LoginMessage | undefined,
	user: Avo.User.User | undefined
): boolean {
	let message: Avo.Auth.LoginMessage | undefined = loginMessage;
	if (!message) {
		const state: any = store.getState();
		message = get(state, 'loginState.data.message');
	}

	return !!message && message === LoginMessage.LOGGED_IN && !!user && isProfileComplete(user);
}
