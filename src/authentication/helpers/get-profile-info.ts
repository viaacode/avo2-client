import {
  AvoLomLomSchemeType,
  AvoUserCommonUser,
  AvoUserProfile,
} from '@viaa/avo2-types';

import { SpecialUserGroupId } from '../../admin/user-groups/user-group.const';
import { CustomError } from '../../shared/helpers/custom-error';
import { getProfile } from '../../shared/helpers/formatters/avatar';

export const getUserGroupLabel = (
  userOrProfile:
    | AvoUserProfile
    | { profile: AvoUserProfile }
    | null
    | undefined,
): string => {
  if (!userOrProfile) {
    console.error(
      new CustomError(
        'Failed to get profile user group label because the provided profile is undefined',
      ),
    );
    return '';
  }

  const profile = getProfile(userOrProfile);
  return ((userOrProfile as any)?.group_name ||
    (profile as any)?.profile_user_group?.group?.label ||
    '') as string;
};

export function getProfileAvatar(
  commonUser: AvoUserCommonUser | undefined,
): string {
  if (!commonUser) {
    throw new CustomError(
      'Failed to get profile avatar because the logged in user/profile is undefined',
    );
  }
  return commonUser.organisation?.logo_url || commonUser.avatar || '';
}

export function getProfileInitials(
  commonUser: AvoUserCommonUser | undefined,
): string {
  if (!commonUser) {
    throw new CustomError(
      'Failed to get profile initials because the logged in user is undefined',
    );
  }
  return (commonUser.firstName || 'X')[0] + (commonUser.lastName || 'X')[0];
}

export function isProfileComplete(
  commonUser: AvoUserCommonUser | null,
): boolean {
  if (!commonUser) {
    return false;
  }

  if (commonUser.isException) {
    return true;
  }

  // Only teachers have to fill in their profile for now
  const userGroupId = commonUser.userGroup?.id;

  const hasSchool = !!commonUser?.educationalOrganisations?.length;
  const educationLevels = commonUser.loms?.filter(
    (lom) => lom.lom?.scheme === AvoLomLomSchemeType.structure,
  );
  const hasEducationLevel = !!educationLevels?.length;
  const hasSubject = !!commonUser.loms?.find(
    (lom) => lom.lom?.scheme === AvoLomLomSchemeType.subject,
  );
  const hasTheme = !!commonUser.loms?.find(
    (lom) => lom.lom?.scheme === AvoLomLomSchemeType.theme,
  );

  // Logic is described here:
  // https://meemoo.atlassian.net/wiki/spaces/AVO2/pages/5379227735#profiel-volledigheid
  if (userGroupId === SpecialUserGroupId.TeacherSecondary) {
    return hasSchool && hasEducationLevel && hasSubject;
  }
  if (userGroupId === SpecialUserGroupId.TeacherElementary) {
    return hasSchool && hasEducationLevel && hasTheme;
  }

  if (userGroupId === SpecialUserGroupId.Teacher) {
    if (hasSchool && hasEducationLevel) {
      const hasElementaryEducationLevel = educationLevels.some(
        (level) =>
          level.lom?.id ===
          'https://w3id.org/onderwijs-vlaanderen/id/structuur/lager-onderwijs',
      );
      const hasSecondaryEducationLevel = educationLevels.some(
        (level) =>
          level.lom?.id ===
          'https://w3id.org/onderwijs-vlaanderen/id/structuur/secundair-onderwijs',
      );
      if (hasElementaryEducationLevel || hasSecondaryEducationLevel) {
        // Elementary or secondary has additional required fields
        return false;
      } else {
        // Other education levels do not require additional fields
        return true;
      }
    }
    return false;
  }

  return true;
}
