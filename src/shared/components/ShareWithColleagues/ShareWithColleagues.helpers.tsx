import { type Avo } from '@viaa/avo2-types';
import { groupBy } from 'lodash-es';

import { isUserLevel } from '../../helpers';
import { EducationLevelId } from '../../helpers/lom';
import { tText } from '../../helpers/translate';

import { type ContributorInfo, ContributorInfoRight } from './ShareWithColleagues.types';

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

export function hasEducationLevel(
	{ education_level_id }: Partial<Avo.Assignment.Assignment>,
	contributor: ContributorInfo
) {
	const isSecondary = isUserLevel(contributor, [EducationLevelId.secundairOnderwijs]);
	const isElementary = isUserLevel(contributor, [EducationLevelId.lagerOnderwijs]);

	const isBoth = isSecondary && isElementary;

	return (
		isBoth ||
		(isSecondary && education_level_id === EducationLevelId.secundairOnderwijs) ||
		(isElementary && education_level_id === EducationLevelId.lagerOnderwijs)
	);
}
