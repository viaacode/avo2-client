import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';

export function isTeacher(userGroupId: number | string | undefined): boolean {
	return (
		!!userGroupId &&
		[
			SpecialUserGroupId.Teacher,
			SpecialUserGroupId.TeacherElementary,
			SpecialUserGroupId.TeacherSecondary,
		].includes(String(userGroupId) as SpecialUserGroupId)
	);
}
