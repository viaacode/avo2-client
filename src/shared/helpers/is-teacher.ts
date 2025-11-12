import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const.js'

/**
 * Checks if the user is an elementary or secondary teacher, any other user group will return false
 * @param userGroupId
 */
export function isTeacher(userGroupId: number | string | undefined): boolean {
  return (
    !!userGroupId &&
    [
      SpecialUserGroupId.Teacher,
      SpecialUserGroupId.TeacherElementary,
      SpecialUserGroupId.TeacherSecondary,
    ].includes(String(userGroupId) as SpecialUserGroupId)
  )
}
