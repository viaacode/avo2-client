import { CommonUserSchema } from '@viaa/avo2-types/types/user';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';

export function isUserPupil(user: CommonUserSchema) {
	return isUser(user, SpecialUserGroup.Pupil);
}

export function isUserElementaryPupil(user: CommonUserSchema) {
	return isUser(user, SpecialUserGroup.ElementaryPupil);
}

export function isUser(user?: CommonUserSchema, group?: SpecialUserGroup) {
	return user?.userGroup?.id === group;
}
