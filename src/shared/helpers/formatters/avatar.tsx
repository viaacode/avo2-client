import { get } from 'lodash-es';
import React, { ReactNode } from 'react';

import { Avatar, AvatarList } from '@viaa/avo2-components';
import { AvatarProps } from '@viaa/avo2-components/dist/components/Avatar/Avatar';
import { Avo } from '@viaa/avo2-types';

const getProfile = (obj: Avo.User.Profile | Avo.User.User | null | undefined) => {
	if (!obj) {
		return null;
	}
	if ((obj as Avo.User.Profile).user) {
		return obj;
	}
	return {
		...((obj as Avo.User.User).profile || {}),
		user: obj as Avo.User.User,
	};
};

export const getInitialChar = (value: string | undefined | null) => (value ? value[0] : '');

export const getInitials = (profile: Avo.User.Profile | null) =>
	getInitialChar(get(profile, 'user.first_name')) + getInitialChar(get(profile, 'user.last_name'));

export const getFullName = (userOrProfile: Avo.User.Profile | Avo.User.User | null | undefined) => {
	return `${get(getProfile(userOrProfile), 'user.first_name')} ${get(
		getProfile(userOrProfile),
		'user.last_name'
	)}`;
};

export const getAbbreviatedFullName = (profile: Avo.User.Profile | null) =>
	`${get(profile, 'user.first_name', '')[0]}. ${get(profile, 'user.last_name')}`;

export const getRole = (profile: Avo.User.Profile | null) => get(profile, 'user.role.name');

export const getAvatarProps = (
	profile: Avo.User.Profile | null,
	options: {
		includeRole?: boolean;
		small?: boolean;
		abbreviatedName?: boolean;
	} = {}
): AvatarProps => {
	const name: string = options.abbreviatedName
		? getAbbreviatedFullName(profile)
		: getFullName(profile);
	const role = getRole(profile);
	const nameAndRole: string = options.includeRole && role ? `${name} (${role})` : name;

	return {
		...(options.small ? { size: 'small' } : {}),
		image: get(profile, 'avatar') || undefined,
		name: nameAndRole,
		initials: getInitials(profile),
	};
};

export const renderAvatar = (
	profile: Avo.User.Profile | undefined,
	options: {
		includeRole?: boolean;
		small?: boolean;
		abbreviatedName?: boolean;
	} = {}
): ReactNode | null => {
	if (!profile) {
		return null;
	}

	const props: AvatarProps = getAvatarProps(profile, options);
	return <Avatar {...props} />;
};

export const renderAvatars = (
	profiles: Avo.User.Profile[],
	options: {
		includeRole?: boolean;
		small?: boolean;
		abbreviatedName?: boolean;
	} = {}
): ReactNode | null => {
	const avatarsProps = profiles.map((profile: Avo.User.Profile) =>
		getAvatarProps(profile, options)
	);
	return <AvatarList avatars={avatarsProps} isOpen={false} />;
};
