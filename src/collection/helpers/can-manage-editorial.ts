import { type Avo } from '@viaa/avo2-types';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const.js';

export const canManageEditorial = (commonUser: Avo.User.CommonUser | undefined): boolean => {
	return (
		[
			SpecialUserGroupId.Admin,
			SpecialUserGroupId.Editor,
			SpecialUserGroupId.EditorInChief,
			SpecialUserGroupId.ContentPartner,
			SpecialUserGroupId.EducativeAuthor,
			SpecialUserGroupId.EducativePartner,
			SpecialUserGroupId.EducativePublisher,
		] as (SpecialUserGroupId | '0')[]
	).includes(String(commonUser?.userGroup?.id) as SpecialUserGroupId);
};
