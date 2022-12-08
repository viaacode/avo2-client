import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';

import { PermissionService } from '../../authentication/helpers/permission-service';

export const canViewAnAssignment = (user?: Avo.User.User): boolean => {
	return (
		PermissionService.hasPerm(user, PermissionName.VIEW_ASSIGNMENTS) ||
		PermissionService.hasPerm(user, PermissionName.VIEW_ANY_ASSIGNMENTS) ||
		PermissionService.hasPerm(user, PermissionName.VIEW_ANY_ASSIGNMENT_RESPONSES) ||
		PermissionService.hasPerm(user, PermissionName.VIEW_OWN_ASSIGNMENT_RESPONSES)
	);
};
