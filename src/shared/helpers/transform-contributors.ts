import { Avo } from '@viaa/avo2-types';
import {
	ShareUserInfo,
	ShareUserInfoRights,
} from '../components/ShareWithColleagues/ShareWithColleagues.types';
import { Contributor } from '../types/contributor';

export const transformContributorsToSimpleContributors = (
	owner: Avo.User.User,
	contributors: Contributor[]
) => {
	if (!owner || !contributors) {
		return;
	}
	const defaultContributors: ShareUserInfo[] = [
		{
			email: owner.mail as string,
			rights: ShareUserInfoRights.OWNER,
			firstName: owner.first_name,
			lastName: owner.last_name,
			profileImage: owner?.profile?.avatar,
			profileId: owner.profile?.id,
		} as ShareUserInfo,
	];

	const mappedContributors = contributors.map((contributor) => {
		return {
			email: contributor.profile.usersByuserId.mail,
			rights: ShareUserInfoRights[contributor.rights as keyof typeof ShareUserInfoRights],
			firstName: contributor.profile.usersByuserId.first_name,
			lastName: contributor.profile.usersByuserId.last_name,
			profileImage: contributor.profile.avatar,
			profileId: contributor.profile_id,
		} as ShareUserInfo;
	});

	return defaultContributors.concat(mappedContributors);
};
