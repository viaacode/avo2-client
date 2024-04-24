import { CommonUserSchema } from '@viaa/avo2-types/types/user';

import { SpecialUserGroup } from '../../admin/user-groups/user-group.const';

export function userIsPupil(user: CommonUserSchema) {
	return userIs(user, SpecialUserGroup.Pupil);
}

export function userIsElementaryPupil(user: CommonUserSchema) {
	return userIs(user, SpecialUserGroup.ElementaryPupil);
}

export function userIs(user: CommonUserSchema, group: SpecialUserGroup) {
	return user.userGroup?.id === group;
}
