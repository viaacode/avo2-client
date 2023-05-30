import { Avo } from '@viaa/avo2-types';

import {
	ContributorInfo,
	ContributorInfoRights,
} from '../components/ShareWithColleagues/ShareWithColleagues.types';
import { Contributor } from '../types/contributor';

export const transformContributorsToSimpleContributors = (
	owner: Avo.User.User,
	contributors: Contributor[]
) => {
	if (!owner || !contributors) {
		return [];
	}
	const defaultContributors: ContributorInfo[] = [
		{
			email: owner.mail as string,
			rights: ContributorInfoRights.OWNER,
			firstName: owner.first_name,
			lastName: owner.last_name,
			profileImage: owner?.profile?.avatar,
			profileId: owner.profile?.id,
		} as ContributorInfo,
	];

	const mappedContributors = contributors.map((contributor) => {
		return {
			email: contributor.profile?.usersByuserId.mail,
			inviteEmail: contributor.invite_email,
			rights: ContributorInfoRights[contributor.rights as keyof typeof ContributorInfoRights],
			firstName: contributor.profile?.usersByuserId.first_name,
			lastName: contributor.profile?.usersByuserId.last_name,
			profileImage: contributor.profile?.avatar,
			profileId: contributor.profile_id,
		} as ContributorInfo;
	});

	return defaultContributors.concat(mappedContributors);
};
