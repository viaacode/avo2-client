import {
  AvoAssignmentAssignment,
  AvoAssignmentContributor,
  AvoCollectionCollection,
  AvoCollectionContributor,
  AvoUserUser,
} from '@viaa/avo2-types';
import {
  type ContributorInfo,
  ContributorInfoRight,
} from '../components/ShareWithColleagues/ShareWithColleagues.types';

export const transformContributorsToSimpleContributors = (
  owner: AvoUserUser | undefined,
  contributors: (AvoCollectionContributor | AvoAssignmentContributor)[],
): ContributorInfo[] => {
  const defaultContributors: ContributorInfo[] = [
    {
      email: owner?.mail,
      rights: ContributorInfoRight.OWNER,
      firstName: owner?.first_name,
      lastName: owner?.last_name,
      profileImage:
        owner?.profile?.organisation?.logo_url || owner?.profile?.avatar,
      profileId: owner?.profile?.id,
    } as ContributorInfo,
  ];

  if (contributors) {
    const mappedContributors = contributors.map((contributor) => {
      return {
        email:
          // Legacy for queries that happen on the client
          contributor.profile?.user?.mail ||
          // More standard way for contributors that have already accepted and assignments that are loaded through the proxy
          contributor.profile?.mail ||
          // For contributors that have not yet accepted the invite
          contributor.invite_email,
        inviteEmail: contributor.invite_email,
        rights:
          ContributorInfoRight[
            contributor.rights as keyof typeof ContributorInfoRight
          ],
        firstName: contributor.profile?.first_name,
        lastName: contributor.profile?.last_name,
        profileImage:
          contributor?.profile?.organisation?.logo_url ||
          contributor.profile?.avatar,
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
  subject: AvoAssignmentAssignment | AvoCollectionCollection,
  contributors: (AvoAssignmentContributor | AvoCollectionContributor)[],
): ContributorInfoRight => {
  if (userProfileId === subject.owner_profile_id) {
    return ContributorInfoRight.OWNER;
  }

  return contributors.find(
    (contributor) => contributor.profile_id === userProfileId,
  )?.rights as ContributorInfoRight;
};
