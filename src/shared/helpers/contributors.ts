import type { Avo } from '@viaa/avo2-types';

import {
	ContributorInfo,
	ContributorInfoRights,
	ShareRightsType,
} from '../components/ShareWithColleagues/ShareWithColleagues.types';

export const transformContributorsToSimpleContributors = (
	owner: Avo.User.User,
	contributors: (Avo.Collection.Contributor | Avo.Assignment.Contributor)[]
): ContributorInfo[] => {
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

	if (contributors) {
		const mappedContributors = contributors.map((contributor) => {
			return {
				email: contributor.profile?.user.mail,
				inviteEmail: contributor.invite_email,
				rights: ContributorInfoRights[
					contributor.rights as keyof typeof ContributorInfoRights
				],
				firstName: contributor.profile?.user.first_name,
				lastName: contributor.profile?.user.last_name,
				profileImage: contributor.profile?.avatar,
				profileId: contributor.profile_id,
				contributorId: contributor.id,
			} as ContributorInfo;
		});
		return defaultContributors.concat(mappedContributors);
	}

	return defaultContributors;
};

export const getContributorType = (
	user: Avo.User.User,
	subject: Avo.Assignment.Assignment | Avo.Collection.Collection,
	contributors: (Avo.Assignment.Contributor | Avo.Collection.Contributor)[]
): ShareRightsType => {
	if (user.profile?.id === subject.owner_profile_id) {
		return ContributorInfoRights.OWNER;
	}

	return contributors.find(
		(contributor) => (contributor.profile_id || contributor?.profile?.id) === user.profile?.id
	)?.rights as ShareRightsType;
};
