import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const.js'

/**
 * Checks if the user is a pupilElementary or pupilSecondary, any other user group will return false
 * @param userGroupId
 */
export function isPupil(userGroupId: string | number | undefined): boolean {
  return (
    !!userGroupId &&
    [SpecialUserGroupId.PupilSecondary, SpecialUserGroupId.PupilElementary]
      .map(String)
      .includes(String(userGroupId) as SpecialUserGroupId)
  )
}
