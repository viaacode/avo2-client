import { get } from 'lodash-es';
import React, { ReactNode } from 'react';

import { Avatar, AvatarList, AvatarProps } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

const getProfile = (
	obj: Avo.User.Profile | Avo.User.User | null | undefined
): Avo.User.Profile | null => {
	if (!obj) {
		return null;
	}
	if ((obj as Avo.User.Profile).user) {
		return (obj as unknown) as Avo.User.Profile;
	}
	return {
		...((obj as Avo.User.User).profile || {}),
		user: obj as Avo.User.User,
	} as Avo.User.Profile;
};

export const getInitialChar = (value: string | undefined | null) => (value ? value[0] : '');

export const getInitials = (profile: Avo.User.Profile | null) =>
	getInitialChar(get(profile, 'user.first_name')) +
	getInitialChar(get(profile, 'user.last_name'));

export const getFullName = (userOrProfile: Avo.User.Profile | Avo.User.User | null | undefined) => {
	if (!userOrProfile) {
		return null;
	}

	const profile = getProfile(userOrProfile);

	const firstName = get(profile, 'user.first_name');
	const lastName = get(profile, 'user.last_name');
	const organisationName = get(profile, 'organisation.name');

	return `${firstName} ${lastName}${organisationName ? ` (${organisationName})` : ''}`;
};

export const getAbbreviatedFullName = (profile: Avo.User.Profile | null) =>
	`${get(profile, 'user.first_name', '')[0]}. ${get(profile, 'user.last_name')}`;

export const getAvatarImage = (profile: Avo.User.Profile | null) =>
	get(profile, 'organisation.logo_url') || get(profile, 'avatar') || undefined;

export const getAvatarProps = (
	profile: Avo.User.Profile | null,
	options: {
		small?: boolean;
		abbreviatedName?: boolean;
	} = {}
): AvatarProps => {
	const name: string = options.abbreviatedName
		? getAbbreviatedFullName(profile)
		: getFullName(profile) || '';

	return {
		name,
		...(options.small ? { size: 'small' } : {}),
		image: getAvatarImage(profile),
		initials: getInitials(profile),
	};
};

export const renderAvatar = (
	userOrProfile: Avo.User.User | Avo.User.Profile | null,
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

export const renderAvatars = (
	profiles: Avo.User.Profile[],
	options: {
		small?: boolean;
		abbreviatedName?: boolean;
	} = {}
): ReactNode | null => {
	const avatarsProps = profiles.map((profile: Avo.User.Profile) =>
		getAvatarProps(profile, options)
	);
	return <AvatarList avatars={avatarsProps} isOpen={false} />;
};
