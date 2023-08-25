import { groupBy } from 'lodash-es';

import { tText } from '../../helpers/translate';

import { ContributorInfo, ContributorInfoRight } from './ShareWithColleagues.types';

export const sortContributors = (users: ContributorInfo[]): ContributorInfo[] => {
	const groupedUsers: Partial<Record<ContributorInfoRight, ContributorInfo[]>> = groupBy(
		users,
		'rights'
	);

	return [
		...(groupedUsers[ContributorInfoRight.OWNER] || []),
		...(groupedUsers[ContributorInfoRight.CONTRIBUTOR] || []),
		...(groupedUsers[ContributorInfoRight.VIEWER] || []),
	];
};

export const compareUsersEmail = (user: ContributorInfo, toCompareUser: ContributorInfo) => {
	return user.email === toCompareUser.email;
};

export const findRightByValue = (right: ContributorInfoRight): ContributorInfoRight => {
	return Object.keys(ContributorInfoRight)[
		Object.values(ContributorInfoRight).indexOf(right)
	] as ContributorInfoRight;
};

export function getContributorRightLabel(right: ContributorInfoRight): string {
	return {
		CONTRIBUTOR: tText(
			'shared/components/share-with-colleagues/share-with-colleagues___bijdrager'
		),
		VIEWER: tText('shared/components/share-with-colleagues/share-with-colleagues___bekijker'),
		OWNER: tText('shared/components/share-with-colleagues/share-with-colleagues___eigenaar'),
	}[right];
}
