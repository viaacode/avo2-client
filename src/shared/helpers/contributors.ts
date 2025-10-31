import { type Avo } from '@viaa/avo2-types';

import {
	type ContributorInfo,
	ContributorInfoRight,
} from '../components/ShareWithColleagues/ShareWithColleagues.types';

export const transformContributorsToSimpleContributors = (
	owner: Avo.User.User | undefined,
	contributors: (Avo.Collection.Contributor | Avo.Assignment.Contributor)[]
): ContributorInfo[] => {
	const defaultContributors: ContributorInfo[] = [
		{
			email: owner?.mail,
			rights: ContributorInfoRight.OWNER,
			firstName: owner?.first_name,
			lastName: owner?.last_name,
			profileImage: owner?.profile?.organisation?.logo_url || owner?.profile?.avatar,
			profileId: owner?.profile?.id,
		} as ContributorInfo,
	];

	if (contributors) {
		const mappedContributors = contributors.map((contributor) => {
			console.log(contributor);
			return {
				email: contributor.profile?.user?.mail || contributor.profile?.user?.mail,
				inviteEmail: contributor.invite_email,
				rights: ContributorInfoRight[
					contributor.rights as keyof typeof ContributorInfoRight
				],
				firstName:
					contributor.profile?.user?.first_name || contributor.profile?.user?.first_name,
				lastName:
					contributor.profile?.user?.last_name || contributor.profile?.user?.last_name,
				profileImage:
					contributor?.profile?.organisation?.logo_url || contributor.profile?.avatar,
				profileId: contributor.profile_id,
				contributorId: contributor.id,
				loms: contributor.profile?.loms,
			} as ContributorInfo;
		});

		return defaultContributors.concat(mappedContributors);
	}

	return defaultContributors;
};

export const getContributorType = (
	userProfileId: string | undefined,
	subject: Avo.Assignment.Assignment | Avo.Collection.Collection,
	contributors: (Avo.Assignment.Contributor | Avo.Collection.Contributor)[]
): ContributorInfoRight => {
	if (userProfileId === subject.owner_profile_id) {
		return ContributorInfoRight.OWNER;
	}

	return contributors.find(
		(contributor) => (contributor.profile_id || contributor?.profile?.id) === userProfileId
	)?.rights as ContributorInfoRight;
};
