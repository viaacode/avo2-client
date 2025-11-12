import type { Avo } from '@viaa/avo2-types';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const.js';

export function isEducationalUser(commonUser: Avo.User.CommonUser | null): boolean {
	return (
		!!commonUser &&
		!!commonUser.userGroup &&
		[SpecialUserGroupId.EducativeAuthor, SpecialUserGroupId.EducativePublisher].includes(
			String(commonUser.userGroup.id) as SpecialUserGroupId
		)
	);
}
