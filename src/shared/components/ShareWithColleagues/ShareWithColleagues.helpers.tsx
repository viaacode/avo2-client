import {type Avo} from '@viaa/avo2-types';
import {groupBy} from 'es-toolkit';

import {isUserLevel} from '../../helpers/is-user.js';
import {EducationLevelId} from '../../helpers/lom.js';
import {tText} from '../../helpers/translate-text.js';

import {type ContributorInfo, ContributorInfoRight} from './ShareWithColleagues.types.js';

export const sortContributors = (users: ContributorInfo[]): ContributorInfo[] => {
	const groupedUsers: Partial<Record<ContributorInfoRight, ContributorInfo[]>> = groupBy(
		users,
		(user) => user.rights
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
	contributor: ContributorInfo,
	assignment?: Partial<Avo.Assignment.Assignment>
) {
	if (!assignment) return false;

	const { education_level_id } = assignment;
	const isSecondary = isUserLevel(contributor, [EducationLevelId.secundairOnderwijs]);
	const isElementary = isUserLevel(contributor, [EducationLevelId.lagerOnderwijs]);

	const isBoth = isSecondary && isElementary;

	return (
		isBoth ||
		(isSecondary && education_level_id === EducationLevelId.secundairOnderwijs) ||
		(isElementary && education_level_id === EducationLevelId.lagerOnderwijs)
	);
}
