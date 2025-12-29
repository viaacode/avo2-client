import { Avatar, type AvatarProps } from '@viaa/avo2-components';
import {
  AvoAssignmentAssignment,
  AvoUserCommonUser,
  AvoUserProfile,
  AvoUserUser,
} from '@viaa/avo2-types';
import { type ReactNode } from 'react';

export const getProfile = (
  obj:
    | AvoUserProfile
    | { profile: AvoUserProfile }
    | AvoAssignmentAssignment['profile']
    | null
    | undefined,
): AvoUserProfile | null => {
  if (!obj) {
    return null;
  }
  if ((obj as AvoUserProfile).user) {
    return obj as unknown as AvoUserProfile;
  }
  return {
    ...((obj as AvoUserUser).profile || {}),
    user: obj as AvoUserUser,
  } as AvoUserProfile;
};

const getInitialChar = (value: string | undefined | null): string =>
  value ? value[0] : '';

const getInitials = (
  profile: AvoUserProfile | AvoUserCommonUser | null,
): string => {
  if ((profile as AvoUserCommonUser)?.profileId) {
    return (
      getInitialChar((profile as AvoUserCommonUser).firstName) +
      getInitialChar((profile as AvoUserCommonUser).lastName)
    );
  }
  return (
    getInitialChar((profile as AvoUserProfile)?.user?.first_name) +
    getInitialChar((profile as AvoUserProfile)?.user?.last_name)
  );
};

/**
 * @deprecated Use getFullNameCommonUser instead
 * @param userOrProfile
 * @param includeCompany
 * @param includeEmail
 */
export const getFullName = (
  userOrProfile:
    | AvoUserProfile
    | { profile: AvoUserProfile }
    | AvoUserCommonUser
    | null
    | undefined,
  includeCompany: boolean,
  includeEmail: boolean,
): string | null => {
  if (!userOrProfile) {
    return null;
  }
  if ((userOrProfile as AvoUserCommonUser).profileId) {
    return getFullNameCommonUser(
      userOrProfile as AvoUserCommonUser,
      includeCompany,
      includeEmail,
    );
  }

  const profile = getProfile(
    userOrProfile as AvoUserProfile | { profile: AvoUserProfile },
  );

  const firstName = profile?.user?.first_name;
  const lastName = profile?.user?.last_name;
  const fullName = profile?.user?.full_name || `${firstName} ${lastName}`;
  const email = includeEmail ? profile?.user?.mail : '';
  const organisationName = includeCompany ? profile?.organisation?.name : '';

  return `${fullName}${organisationName ? ` (${organisationName})` : ''}${
    includeEmail ? ` (${email})` : ''
  }`;
};

export const getFullNameCommonUser = (
  commonUser: AvoUserCommonUser | null | undefined,
  includeCompany: boolean,
  includeEmail: boolean,
): string | null => {
  if (!commonUser) {
    return null;
  }

  const firstName = commonUser.firstName;
  const lastName = commonUser.lastName;
  const fullName = commonUser.fullName || `${firstName} ${lastName}`;
  const email = includeEmail ? commonUser.email : '';
  const organisationName = includeCompany
    ? commonUser.organisation?.name || ''
    : '';

  return `${fullName}${organisationName ? ` (${organisationName})` : ''}${
    includeEmail ? ` (${email})` : ''
  }`;
};

const getAbbreviatedFullName = (
  profile: AvoUserProfile | AvoUserCommonUser | null,
): string => {
  if ((profile as AvoUserCommonUser)?.profileId) {
    return `${(profile as AvoUserCommonUser).firstName?.[0] || 'x'}. ${
      (profile as AvoUserCommonUser).lastName
    }`;
  }
  return `${((profile as AvoUserProfile)?.user?.first_name || '')[0]}. ${
    (profile as AvoUserProfile)?.user?.last_name || ''
  }`;
};

const getAvatarImage = (
  profile: AvoUserProfile | AvoUserCommonUser | null,
): string => profile?.organisation?.logo_url || profile?.avatar || '';

const getAvatarProps = (
  profile: AvoUserProfile | AvoUserCommonUser | null,
  options: {
    small?: boolean;
    abbreviatedName?: boolean;
  } = {},
): AvatarProps => {
  const name: string = options.abbreviatedName
    ? getAbbreviatedFullName(profile)
    : getFullName(profile, true, false) || '';

  return {
    name,
    ...(options.small ? { size: 'small' } : {}),
    image: getAvatarImage(profile),
    initials: getInitials(profile),
  };
};

export const renderAvatar = (
  userOrProfile:
    | AvoUserProfile
    | { profile: AvoUserProfile }
    | AvoAssignmentAssignment['profile']
    | AvoUserCommonUser
    | null,
  options: {
    small?: boolean;
    abbreviatedName?: boolean;
    dark?: boolean;
  } = {},
): ReactNode | null => {
  let profile: AvoUserProfile | AvoUserCommonUser | null;
  if ((userOrProfile as AvoUserCommonUser)?.profileId) {
    profile = userOrProfile as AvoUserCommonUser;
  } else {
    profile = getProfile(
      userOrProfile as
        | AvoUserProfile
        | {
            profile: AvoUserProfile;
          }
        | null
        | undefined,
    );
  }

  if (!profile) {
    return null;
  }

  const props: AvatarProps = getAvatarProps(profile, options);

  return <Avatar dark={options.dark} {...props} />;
};
