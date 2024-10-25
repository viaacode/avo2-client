import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';

export function isPupil(userGroupId: string | number | undefined): boolean {
	return (
		!!userGroupId &&
		[SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
			.map(String)
			.includes(String(userGroupId) as SpecialUserGroupId)
	);
}
