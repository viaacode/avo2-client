import { Avo } from '@viaa/avo2-types';

import { ShareRightsType } from '../components/ShareWithColleagues/ShareWithColleagues.types';
import { Contributor } from '../types/contributor';

export const getUserRoleType = (
	user: Avo.User.User,
	subject: Avo.Assignment.Assignment | Avo.Collection.Collection,
	contributors: Contributor[]
): ShareRightsType => {
	if (user.profile?.id === subject.owner_profile_id) {
		return 'OWNER';
	}

	return contributors.find((contributor) => contributor.profile_id === user.profile?.id)
		?.rights as ShareRightsType;
};
