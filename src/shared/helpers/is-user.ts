import { type Avo } from '@viaa/avo2-types/types';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';

import { EducationLevelId } from './lom';

type UserLomsAndUserGroup = Pick<Avo.User.CommonUser, 'loms' | 'userGroup'>;

export function isUserGroup(user?: UserLomsAndUserGroup, group?: SpecialUserGroup) {
	return user?.userGroup?.id === group;
}

export function isUserPupilSecondary(user: UserLomsAndUserGroup) {
	return isUserGroup(user, SpecialUserGroup.PupilSecondary);
}

export function isUserPupilElementary(user: UserLomsAndUserGroup) {
	return isUserGroup(user, SpecialUserGroup.PupilElementary);
}

export function isUserTeacherSecondary(user: UserLomsAndUserGroup) {
	return isUserGroup(user, SpecialUserGroup.TeacherSecondary);
}

/**
 * @param user The user to evaluate
 * @returns A boolean indicating if they have both Elementary & Secondary LOM's
 */
export function isUserSecondaryElementary(user: UserLomsAndUserGroup) {
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
