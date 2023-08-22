import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';

import { PermissionService } from '../../authentication/helpers/permission-service';
import { CheckboxOption } from '../components';
import { QuickLaneType } from '../components/QuickLaneModal/QuickLaneModal.types';

import { tText } from './translate';

export const isOrganisational = (user: Avo.User.User): boolean => {
	return PermissionService.hasAtLeastOnePerm(user, [
		PermissionName.VIEW_OWN_ORGANISATION_QUICK_LANE_OVERVIEW,
	]);
};

export const isPersonal = (user: Avo.User.User): boolean => {
	return PermissionService.hasAtLeastOnePerm(user, [
		PermissionName.VIEW_PERSONAL_QUICK_LANE_OVERVIEW,
	]);
};

export const getTypeOptions = (): CheckboxOption[] => {
	const translations: Record<QuickLaneType, string> = {
		['ITEM']: tText('workspace/views/quick-lane-overview___item'),
		['COLLECTIE']: tText('workspace/views/quick-lane-overview___collectie'),
	};

	const options: QuickLaneType[] = ['ITEM', 'COLLECTIE'];

	return options.map((label) => {
		return {
			checked: false,
			id: label,
			label: translations[label] || '',
		};
	});
};
