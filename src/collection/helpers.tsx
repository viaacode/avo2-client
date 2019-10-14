import { Avatar } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { ReactNode } from 'react';

export const isMediaFragment = (fragmentInfo: { external_id: string | undefined }) => {
	return fragmentInfo.external_id && fragmentInfo.external_id !== '-1';
};

export const getInitialChar = (value: string | undefined | null) => (value ? value[0] : '');

export const getInitials = (profile: Avo.User.Profile | null) =>
	getInitialChar(get(profile, 'user.first_name')) + getInitialChar(get(profile, 'user.last_name'));

export const getFullName = (profile: Avo.User.Profile | null) =>
	`${get(profile, 'user.first_name')} ${get(profile, 'user.last_name')}`;

export const getAbbreviatedFullName = (profile: Avo.User.Profile | null) =>
	`${get(profile, 'user.first_name', '')[0]}. ${get(profile, 'user.last_name')}`;

export const getRole = (profile: Avo.User.Profile | null) => get(profile, 'user.role.name');

export const renderAvatar = (
	profile: Avo.User.Profile | null,
	options: {
		includeRole?: boolean;
		small?: boolean;
		abbreviatedName?: boolean;
	}
): ReactNode | null => {
	if (!profile) {
		return null;
	}
	const name: string = options.abbreviatedName
		? getAbbreviatedFullName(profile)
		: getFullName(profile);
	const role = getRole(profile);
	const nameAndRole: string = options.includeRole && role ? `${name} (${role})` : name;

	return (
		<Avatar
			{...(options.small ? { size: 'small' } : {})}
			image={get(profile, 'avatar') || undefined}
			name={nameAndRole}
			initials={getInitials(profile)}
		/>
	);
};
