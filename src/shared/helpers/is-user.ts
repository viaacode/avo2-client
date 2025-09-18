import { type Avo } from '@viaa/avo2-types/types';

import { EducationLevelId } from './lom';

type UserLomsAndUserGroup = Pick<Avo.User.CommonUser, 'loms' | 'userGroup'>;

/**
 * @param user The user to evaluate
 * @returns A boolean indicating if they have both Elementary & Secondary LOM's
 */
export function isUserSecondaryElementary(user: UserLomsAndUserGroup | null | undefined): boolean {
	if (!user) {
		return false;
	}
	return isUserLevel(user, [
		EducationLevelId.lagerOnderwijs,
		EducationLevelId.secundairOnderwijs,
	]);
}

export function isUserLevel(
	user: Partial<Pick<UserLomsAndUserGroup, 'loms'>>,
	levels: EducationLevelId[]
) {
	return levels.every(
		(level) => user.loms?.find(({ lom, lom_id }) => (lom_id || lom?.id) === level)
	);
}
