import { CommonUserSchema } from '@viaa/avo2-types/types/user';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';

export function isUserPupil(user: CommonUserSchema) {
	return isUser(user, SpecialUserGroup.PupilSecondary);
}

export function isUserElementaryPupil(user: CommonUserSchema) {
	return isUser(user, SpecialUserGroup.PupilElementary);
}

export function isUser(user?: CommonUserSchema, group?: SpecialUserGroup) {
	return user?.userGroup?.id === group;
}
