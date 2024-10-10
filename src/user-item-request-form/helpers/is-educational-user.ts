import type { Avo } from '@viaa/avo2-types';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';

export function isEducationalUser(commonUser: Avo.User.CommonUser | null): boolean {
	return (
		!!commonUser &&
		!!commonUser.userGroup &&
		[SpecialUserGroup.EducativeAuthor, SpecialUserGroup.EducativePublisher].includes(
			String(commonUser.userGroup.id) as SpecialUserGroup
		)
	);
}
