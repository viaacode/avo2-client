import { type Avo } from '@viaa/avo2-types';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';

export const canManageEditorial = (commonUser: Avo.User.CommonUser | undefined): boolean => {
	return (
		[
			SpecialUserGroup.Admin,
			SpecialUserGroup.Editor,
			SpecialUserGroup.EditorInChief,
			SpecialUserGroup.ContentPartner,
			SpecialUserGroup.EducativeAuthor,
			SpecialUserGroup.EducativePartner,
			SpecialUserGroup.EducativePublisher,
		] as (SpecialUserGroup | '0')[]
	).includes(String(commonUser?.userGroup?.id) as SpecialUserGroup);
};
