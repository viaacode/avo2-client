import { type CommonUserSchema } from '@viaa/avo2-types/types/user';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';

import { EducationLevelId } from './lom';

type UserLomsAndUserGroup = Pick<CommonUserSchema, 'loms' | 'userGroup'>;

export function isUserPupil(user: UserLomsAndUserGroup) {
	return isUser(user, SpecialUserGroup.PupilSecondary);
}

export function isUserElementaryPupil(user: UserLomsAndUserGroup) {
	return isUser(user, SpecialUserGroup.PupilElementary);
}

export function isUserSecondaryTeacher(user: UserLomsAndUserGroup) {
	return isUser(user, SpecialUserGroup.TeacherSecondary);
}

export function isUserDoubleTeacher(user: UserLomsAndUserGroup) {
	// DoubleTeacher must always also be a SecondaryTeacher
	if (!isUserSecondaryTeacher(user)) return false;

	const levels = [EducationLevelId.lagerOnderwijs, EducationLevelId.secundairOnderwijs];
	const hasLevels = levels.every((level) => user.loms.find(({ lom }) => lom?.id === level));

	return hasLevels;
}

export function isUser(user?: UserLomsAndUserGroup, group?: SpecialUserGroup) {
	return user?.userGroup?.id === group;
}
