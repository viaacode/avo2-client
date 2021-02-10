import { Avo } from '@viaa/avo2-types';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { getUserGroupId } from '../../authentication/helpers/get-profile-info';

export function canManageEditorial(user: Avo.User.User): boolean {
	return [
		SpecialUserGroup.Admin,
		SpecialUserGroup.Editor,
		SpecialUserGroup.EditorInChief,
	].includes(getUserGroupId(user as any));
}
