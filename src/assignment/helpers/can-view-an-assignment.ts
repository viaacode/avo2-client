import { UserSchema } from '@viaa/avo2-types/types/user';

import { PermissionName } from '../../authentication/helpers/permission-names';
import { PermissionService } from '../../authentication/helpers/permission-service';

export const canViewAnAssignment = (user?: UserSchema): boolean => {
	return (
		PermissionService.hasPerm(user, PermissionName.VIEW_ASSIGNMENTS) ||
		PermissionService.hasPerm(user, PermissionName.VIEW_ANY_ASSIGNMENTS) ||
		PermissionService.hasPerm(user, PermissionName.VIEW_ANY_ASSIGNMENT_RESPONSES) ||
		PermissionService.hasPerm(user, PermissionName.VIEW_OWN_ASSIGNMENT_RESPONSES)
	);
};
