import { type Avo } from '@viaa/avo2-types';
import { LomSchemeType } from '@viaa/avo2-types';
import { get } from 'lodash-es';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { CustomError, getProfile } from '../../shared/helpers';

export const getFirstName = (user: Avo.User.User | undefined, defaultName = ''): string => {
	if (!user) {
		throw new CustomError(
			'Failed to get user first name because the logged in user is undefined'
		);
	}
	return get(user, 'first_name') || defaultName;
};

export function hasIdpLinked(user: Avo.User.User, idpType: Avo.Auth.IdpType): boolean {
	const idpTypesOnUser = (user?.idpmaps || []) as Avo.Auth.IdpType[];
	if (idpType === 'VLAAMSEOVERHEID') {
		return (
			idpTypesOnUser.includes('VLAAMSEOVERHEID') ||
			idpTypesOnUser.includes('VLAAMSEOVERHEID__SUB_ID') ||
			idpTypesOnUser.includes('VLAAMSEOVERHEID__ACCOUNT_ID')
		);
	}
	return idpTypesOnUser.includes(idpType);
}

export const getLastName = (user: Avo.User.User | undefined, defaultName = ''): string => {
	if (!user) {
		throw new CustomError(
			'Failed to get user last name because the logged in user is undefined'
		);
	}
	return get(user, 'last_name') || defaultName;
};

export const getUserGroupLabel = (
	userOrProfile: Avo.User.Profile | { profile: Avo.User.Profile } | null | undefined
): string => {
	if (!userOrProfile) {
		console.error(
			new CustomError(
				'Failed to get profile user group label because the provided profile is undefined'
			)
		);
		return '';
	}

	const profile = getProfile(userOrProfile);
	return get(userOrProfile, 'group_name') || get(profile, 'profile_user_group.group.label') || '';
};

export const getUserGroupId = (
	userOrProfile: Avo.User.Profile | null | undefined
): SpecialUserGroup | '0' => {
	if (!userOrProfile) {
		console.error(
			new CustomError(
				'Failed to get profile user group id because the provided profile is undefined'
			)
		);
		return '0'; // unknown
	}
	const groups: (string | number)[] = (userOrProfile as Avo.User.Profile).userGroupIds;

	if (groups && groups.length) {
		return String(groups[0]) as SpecialUserGroup;
	}

	const profile = getProfile(userOrProfile);
	const userGroupId = String(
		profile?.userGroupIds?.[0] || (profile as any)?.profile_user_group?.group?.id || '0'
	);

	if (!userGroupId) {
		console.error('Failed to get user group id from profile');
	}

	return userGroupId as SpecialUserGroup | '0';
};

export function getProfileAvatar(user: Avo.User.User | undefined): string {
	const profile = get(user, 'profile');
	if (!profile) {
		throw new CustomError(
			'Failed to get profile avatar because the logged in user/profile is undefined'
		);
	}
	return get(profile, 'organisation.logo_url') || get(profile, 'avatar') || '';
}

export function getProfileInitials(user: Avo.User.User | undefined): string {
	if (!user) {
		throw new CustomError(
			'Failed to get profile initials because the logged in user is undefined'
		);
	}
	return getFirstName(user, 'X')[0] + getLastName(user, 'X')[0];
}

export function isProfileComplete(user: Avo.User.User): boolean {
	const profile = user?.profile;

	if (!!profile && profile.is_exception) {
		return true;
	}

	// Only teachers have to fill in their profile for now
	const userGroupId = getUserGroupId(user?.profile);

	if (userGroupId === SpecialUserGroup.TeacherSecondary) {
		return (
			!!profile &&
			!!profile.organizations &&
			!!profile.organizations.length &&
			!!profile.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.structure) &&
			!!profile.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.subject)
		);
	}
	if (userGroupId === SpecialUserGroup.Teacher) {
		return (
			!!profile &&
			!!profile.organizations &&
			!!profile.organizations.length &&
			!!profile.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.structure) &&
			!!profile.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.theme)
		);
	}

	return true;
}
