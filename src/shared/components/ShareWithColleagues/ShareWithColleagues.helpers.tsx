import { groupBy } from 'lodash-es';

import {
	ContributorInfo,
	ContributorInfoRights,
	ShareRightsType,
} from './ShareWithColleagues.types';

export const sortContributors = (users: ContributorInfo[]): ContributorInfo[] => {
	const groupedUsers: Partial<Record<ContributorInfoRights, ContributorInfo[]>> = groupBy(
		users,
		'rights'
	);

	return [
		...(groupedUsers[ContributorInfoRights.OWNER] || []),
		...(groupedUsers[ContributorInfoRights.CONTRIBUTOR] || []),
		...(groupedUsers[ContributorInfoRights.VIEWER] || []),
	];
};

export const contributorRightToString = (right: ContributorInfoRights) => {
	return right.toLowerCase();
};

export const compareUsersEmail = (user: ContributorInfo, toCompareUser: ContributorInfo) => {
	return user.email === toCompareUser.email;
};

export const findRightByValue = (right: ContributorInfoRights): ShareRightsType => {
	return Object.keys(ContributorInfoRights)[
		Object.values(ContributorInfoRights).indexOf(right)
	] as ShareRightsType;
};