import { UserSchema } from '@viaa/avo2-types/types/user';

import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { CheckboxOption } from '../components';
import { Lookup_Enum_Assignment_Content_Labels_Enum } from '../generated/graphql-db-types';

import { tText } from './translate';

export const isOrganisational = (user: UserSchema): boolean => {
	return PermissionService.hasAtLeastOnePerm(user, [
		PermissionName.VIEW_OWN_ORGANISATION_QUICK_LANE_OVERVIEW,
	]);
};

export const isPersonal = (user: UserSchema): boolean => {
	return PermissionService.hasAtLeastOnePerm(user, [
		PermissionName.VIEW_PERSONAL_QUICK_LANE_OVERVIEW,
	]);
};

export const getTypeOptions = (): CheckboxOption[] => {
	const translations: {
		// eslint-disable-next-line
		[x in Lookup_Enum_Assignment_Content_Labels_Enum]?: string;
	} = {
		[Lookup_Enum_Assignment_Content_Labels_Enum.Item]: tText(
			'workspace/views/quick-lane-overview___item'
		),
		[Lookup_Enum_Assignment_Content_Labels_Enum.Collectie]: tText(
			'workspace/views/quick-lane-overview___collectie'
		),
	};

	const options: Lookup_Enum_Assignment_Content_Labels_Enum[] = [
		Lookup_Enum_Assignment_Content_Labels_Enum.Item,
		Lookup_Enum_Assignment_Content_Labels_Enum.Collectie,
	];

	return options.map((label) => {
		return {
			checked: false,
			id: label,
			label: translations[label] || '',
		};
	});
};
