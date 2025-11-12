import { type Avo, PermissionName } from '@viaa/avo2-types';

import { PermissionService } from '../../authentication/helpers/permission-service.js';

export const canViewAnAssignment = (commonUser?: Avo.User.CommonUser | null): boolean => {
	if (!commonUser) {
		return false;
	}
	return (
		PermissionService.hasPerm(commonUser, PermissionName.VIEW_ASSIGNMENTS) ||
		PermissionService.hasPerm(commonUser, PermissionName.VIEW_ANY_ASSIGNMENTS) ||
		PermissionService.hasPerm(commonUser, PermissionName.VIEW_ANY_ASSIGNMENT_RESPONSES) ||
		PermissionService.hasPerm(commonUser, PermissionName.VIEW_OWN_ASSIGNMENT_RESPONSES)
	);
};
