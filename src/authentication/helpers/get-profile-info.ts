import { type Avo, LomSchemeType } from '@viaa/avo2-types'

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { CustomError } from '../../shared/helpers/custom-error';
import { getProfile } from '../../shared/helpers/formatters/avatar';

export const getUserGroupLabel = (
  userOrProfile:
    | Avo.User.Profile
    | { profile: Avo.User.Profile }
    | null
    | undefined,
): string => {
  if (!userOrProfile) {
    console.error(
      new CustomError(
        'Failed to get profile user group label because the provided profile is undefined',
      ),
    )
    return ''
  }

  const profile = getProfile(userOrProfile)
  return ((userOrProfile as any)?.group_name ||
    (profile as any)?.profile_user_group?.group?.label ||
    '') as string
}

export function getProfileAvatar(
  commonUser: Avo.User.CommonUser | undefined,
): string {
  if (!commonUser) {
    throw new CustomError(
      'Failed to get profile avatar because the logged in user/profile is undefined',
    )
  }
  return commonUser.organisation?.logo_url || commonUser.avatar || ''
}

export function getProfileInitials(
  commonUser: Avo.User.CommonUser | undefined,
): string {
  if (!commonUser) {
    throw new CustomError(
      'Failed to get profile initials because the logged in user is undefined',
    )
  }
  return (commonUser.firstName || 'X')[0] + (commonUser.lastName || 'X')[0]
}

export function isProfileComplete(
  commonUser: Avo.User.CommonUser | null,
): boolean {
  if (!commonUser) {
    return false
  }

  if (commonUser.isException) {
    return true
  }

  // Only teachers have to fill in their profile for now
  const userGroupId = commonUser.userGroup?.id

  if (userGroupId === SpecialUserGroupId.TeacherSecondary) {
    return (
      !!commonUser &&
      !!commonUser.educationalOrganisations?.length &&
      !!commonUser.loms?.find(
        (lom) => lom.lom?.scheme === LomSchemeType.structure,
      ) &&
      !!commonUser.loms?.find(
        (lom) => lom.lom?.scheme === LomSchemeType.subject,
      )
    )
  }
  if (userGroupId === SpecialUserGroupId.Teacher) {
    return (
      !!commonUser &&
      !!commonUser.educationalOrganisations?.length &&
      !!commonUser.loms?.find(
        (lom) => lom.lom?.scheme === LomSchemeType.structure,
      ) &&
      !!commonUser.loms?.find((lom) => lom.lom?.scheme === LomSchemeType.theme)
    )
  }

  return true
}
