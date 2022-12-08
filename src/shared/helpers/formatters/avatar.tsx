import { Avatar, AvatarProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { ReactNode } from 'react';

import { Assignment_v2 } from '../../../assignment/assignment.types';

export const getProfile = (
	obj:
		| Avo.User.Profile
		| { profile: Avo.User.Profile }
		| Assignment_v2['profile']
		| null
		| undefined
): Avo.User.Profile | null => {
	if (!obj) {
		return null;
	}
	if ((obj as Avo.User.Profile).user) {
		return obj as unknown as Avo.User.Profile;
	}
	return {
		...((obj as Avo.User.User).profile || {}),
		user: obj as Avo.User.User,
	} as Avo.User.Profile;
};

export const getInitialChar = (value: string | undefined | null): string => (value ? value[0] : '');

export const getInitials = (profile: Avo.User.Profile | null): string =>
	getInitialChar(get(profile, 'user.first_name')) +
	getInitialChar(get(profile, 'user.last_name'));

export const getFullName = (
	userOrProfile: Avo.User.Profile | { profile: Avo.User.Profile } | null | undefined,
	includeCompany: boolean,
	includeEmail: boolean
): string | null => {
	if (!userOrProfile) {
		return null;
	}

	const profile = getProfile(userOrProfile);

	const firstName = get(profile, 'user.first_name');
	const lastName = get(profile, 'user.last_name');
	const fullName = get(profile, 'user.full_name') || `${firstName} ${lastName}`;
	const email = includeEmail ? get(profile, 'user.mail') : '';
	const organisationName = includeCompany ? get(profile, 'organisation.name') : '';

	return `${fullName}${organisationName ? ` (${organisationName})` : ''}${
		includeEmail ? ` (${email})` : ''
	}`;
};

export const getAbbreviatedFullName = (profile: Avo.User.Profile | null): string =>
	`${(profile?.user?.first_name || '')[0]}. ${profile?.user?.last_name || ''}`;

export const getAvatarImage = (profile: Avo.User.Profile | null): string =>
	get(profile, 'organisation.logo_url') || get(profile, 'avatar') || '';

export const getAvatarProps = (
	profile: Avo.User.Profile | null,
	options: {
		small?: boolean;
		abbreviatedName?: boolean;
	} = {}
): AvatarProps => {
	const name: string = options.abbreviatedName
		? getAbbreviatedFullName(profile)
		: getFullName(profile, true, false) || '';

	return {
		name,
		...(options.small ? { size: 'small' } : {}),
		image: getAvatarImage(profile),
		initials: getInitials(profile),
	};
};

export const renderAvatar = (
	userOrProfile:
		| Avo.User.Profile
		| { profile: Avo.User.Profile }
		| Assignment_v2['profile']
		| null,
	options: {
		small?: boolean;
		abbreviatedName?: boolean;
		dark?: boolean;
	} = {}
): ReactNode | null => {
	const profile = getProfile(userOrProfile);

	if (!profile) {
		return null;
	}

	const props: AvatarProps = getAvatarProps(profile, options);

	return <Avatar dark={options.dark} {...props} />;
};
