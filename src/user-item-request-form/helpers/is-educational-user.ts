import { AvoUserCommonUser } from '@viaa/avo2-types';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';

export function isEducationalUser(
  commonUser: AvoUserCommonUser | null,
): boolean {
  return (
    !!commonUser &&
    !!commonUser.userGroup &&
    [
      SpecialUserGroupId.EducativeAuthor,
      SpecialUserGroupId.EducativePublisher,
    ].includes(String(commonUser.userGroup.id) as SpecialUserGroupId)
  );
}
