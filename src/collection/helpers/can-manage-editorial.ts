import type { Avo } from '@viaa/avo2-types';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';
import { getUserGroupId } from '../../authentication/helpers/get-profile-info';

export const canManageEditorial = (user: Avo.User.User): boolean => {
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
	).includes(getUserGroupId(user.profile));
};
