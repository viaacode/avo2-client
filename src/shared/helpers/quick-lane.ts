import { TFunction } from 'i18next';

import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { UserSchema } from '@viaa/avo2-types/types/user';

import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { CheckboxOption } from '../components';

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

export const getTypeOptions = (t: TFunction): CheckboxOption[] => {
	const translations: {
		[x in AssignmentContentLabel]?: string;
	} = {
		ITEM: t('workspace/views/quick-lane-overview___item'),
		COLLECTIE: t('workspace/views/quick-lane-overview___collectie'),
	};

	const options: AssignmentContentLabel[] = ['ITEM', 'COLLECTIE'];

	return options.map((label) => {
		return {
			checked: false,
			id: label,
			label: translations[label] || '',
		};
	});
};
