import { AvoUserCommonUser } from '@viaa/avo2-types';
import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';

export const canManageEditorial = (
  commonUser: AvoUserCommonUser | undefined,
): boolean => {
  return (
    [
      SpecialUserGroupId.Admin,
      SpecialUserGroupId.Editor,
      SpecialUserGroupId.EditorInChief,
      SpecialUserGroupId.ContentPartner,
      SpecialUserGroupId.EducativeAuthor,
      SpecialUserGroupId.EducativePartner,
      SpecialUserGroupId.EducativePublisher,
    ] as (SpecialUserGroupId | '0')[]
  ).includes(String(commonUser?.userGroup?.id) as SpecialUserGroupId);
};
