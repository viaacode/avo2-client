import { Avatar, type AvatarProps } from '@viaa/avo2-components'
import { type Avo } from '@viaa/avo2-types'
import React, { type ReactNode } from 'react'

export const getProfile = (
  obj:
    | Avo.User.Profile
    | { profile: Avo.User.Profile }
    | Avo.Assignment.Assignment['profile']
    | null
    | undefined,
): Avo.User.Profile | null => {
  if (!obj) {
    return null
  }
  if ((obj as Avo.User.Profile).user) {
    return obj as unknown as Avo.User.Profile
  }
  return {
    ...((obj as Avo.User.User).profile || {}),
    user: obj as Avo.User.User,
  } as Avo.User.Profile
}

const getInitialChar = (value: string | undefined | null): string =>
  value ? value[0] : ''

const getInitials = (
  profile: Avo.User.Profile | Avo.User.CommonUser | null,
): string => {
  if ((profile as Avo.User.CommonUser)?.profileId) {
    return (
      getInitialChar((profile as Avo.User.CommonUser).firstName) +
      getInitialChar((profile as Avo.User.CommonUser).lastName)
    )
  }
  return (
    getInitialChar((profile as Avo.User.Profile)?.user?.first_name) +
    getInitialChar((profile as Avo.User.Profile)?.user?.last_name)
  )
}

/**
 * @deprecated Use getFullNameCommonUser instead
 * @param userOrProfile
 * @param includeCompany
 * @param includeEmail
 */
export const getFullName = (
  userOrProfile:
    | Avo.User.Profile
    | { profile: Avo.User.Profile }
    | Avo.User.CommonUser
    | null
    | undefined,
  includeCompany: boolean,
  includeEmail: boolean,
): string | null => {
  if (!userOrProfile) {
    return null
  }
  if ((userOrProfile as Avo.User.CommonUser).profileId) {
    return getFullNameCommonUser(
      userOrProfile as Avo.User.CommonUser,
      includeCompany,
      includeEmail,
    )
  }

  const profile = getProfile(
    userOrProfile as Avo.User.Profile | { profile: Avo.User.Profile },
  )

  const firstName = profile?.user?.first_name
  const lastName = profile?.user?.last_name
  const fullName = profile?.user?.full_name || `${firstName} ${lastName}`
  const email = includeEmail ? profile?.user?.mail : ''
  const organisationName = includeCompany ? profile?.organisation?.name : ''

  return `${fullName}${organisationName ? ` (${organisationName})` : ''}${
    includeEmail ? ` (${email})` : ''
  }`
}

export const getFullNameCommonUser = (
  commonUser: Avo.User.CommonUser | null | undefined,
  includeCompany: boolean,
  includeEmail: boolean,
): string | null => {
  if (!commonUser) {
    return null
  }

  const firstName = commonUser.firstName
  const lastName = commonUser.lastName
  const fullName = commonUser.fullName || `${firstName} ${lastName}`
  const email = includeEmail ? commonUser.email : ''
  const organisationName = includeCompany
    ? commonUser.organisation?.name || ''
    : ''

  return `${fullName}${organisationName ? ` (${organisationName})` : ''}${
    includeEmail ? ` (${email})` : ''
  }`
}

const getAbbreviatedFullName = (
  profile: Avo.User.Profile | Avo.User.CommonUser | null,
): string => {
  if ((profile as Avo.User.CommonUser)?.profileId) {
    return `${(profile as Avo.User.CommonUser).firstName?.[0] || 'x'}. ${
      (profile as Avo.User.CommonUser).lastName
    }`
  }
  return `${((profile as Avo.User.Profile)?.user?.first_name || '')[0]}. ${
    (profile as Avo.User.Profile)?.user?.last_name || ''
  }`
}

const getAvatarImage = (
  profile: Avo.User.Profile | Avo.User.CommonUser | null,
): string => profile?.organisation?.logo_url || profile?.avatar || ''

const getAvatarProps = (
  profile: Avo.User.Profile | Avo.User.CommonUser | null,
  options: {
    small?: boolean
    abbreviatedName?: boolean
  } = {},
): AvatarProps => {
  const name: string = options.abbreviatedName
    ? getAbbreviatedFullName(profile)
    : getFullName(profile, true, false) || ''

  return {
    name,
    ...(options.small ? { size: 'small' } : {}),
    image: getAvatarImage(profile),
    initials: getInitials(profile),
  }
}

export const renderAvatar = (
  userOrProfile:
    | Avo.User.Profile
    | { profile: Avo.User.Profile }
    | Avo.Assignment.Assignment['profile']
    | Avo.User.CommonUser
    | null,
  options: {
    small?: boolean
    abbreviatedName?: boolean
    dark?: boolean
  } = {},
): ReactNode | null => {
  let profile: Avo.User.Profile | Avo.User.CommonUser | null
  if ((userOrProfile as Avo.User.CommonUser)?.profileId) {
    profile = userOrProfile as Avo.User.CommonUser
  } else {
    profile = getProfile(
      userOrProfile as
        | Avo.User.Profile
        | {
            profile: Avo.User.Profile
          }
        | null
        | undefined,
    )
  }

  if (!profile) {
    return null
  }

  const props: AvatarProps = getAvatarProps(profile, options)

  return <Avatar dark={options.dark} {...props} />
}
