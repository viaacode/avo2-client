import {
  Box,
  Button,
  ButtonToolbar,
  Container,
  Form,
  FormGroup,
  TextArea,
  TextInput,
} from '@viaa/avo2-components'
import { type Avo, PermissionName } from '@viaa/avo2-types'
import { compact } from 'es-toolkit'
import React, { type FC, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useParams } from 'react-router'

import { PermissionGuard } from '../../../authentication/components/PermissionGuard.js'
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page.js'
import { GENERATE_SITE_TITLE } from '../../../constants.js'
import { SettingsService } from '../../../settings/settings.service.js'
import { FileUpload } from '../../../shared/components/FileUpload/FileUpload.js'
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { LomFieldsInput } from '../../../shared/components/LomFieldsInput/LomFieldsInput.js'
import { buildLink } from '../../../shared/helpers/build-link.js'
import { CustomError } from '../../../shared/helpers/custom-error.js'
import { PHOTO_TYPES } from '../../../shared/helpers/files.js'
import { navigate } from '../../../shared/helpers/link.js'
import { tText } from '../../../shared/helpers/translate-text.js'
import { ToastService } from '../../../shared/services/toast-service.js'
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout.js'
import {
  AdminLayoutBody,
  AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots.js'
import { useGetProfileById } from '../hooks/use-get-profile-by-id.js'
import { USER_PATH } from '../user.const.js'

export const UserEditPage: FC = () => {
  const navigateFunc = useNavigate()

  const { id: profileId } = useParams<{ id: string }>()

  // Hooks
  const { data: profile, isLoading } = useGetProfileById(profileId)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [profileErrors, setProfileErrors] = useState<
    Partial<{ [prop in keyof Avo.User.UpdateProfileValues]: string }>
  >({})

  const [firstName, setFirstName] = useState<string | undefined>()
  const [lastName, setLastName] = useState<string | undefined>()
  const [avatar, setAvatar] = useState<string | undefined>()
  const [title, setTitle] = useState<string | undefined>()
  const [bio, setBio] = useState<string | undefined>()
  const [alias, setAlias] = useState<string | undefined>()
  const [companyId, setCompanyId] = useState<string | undefined>()
  const [loms, setLoms] = useState<Avo.Lom.LomField[]>([])

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '')
      setLastName(profile.lastName || '')
      setAvatar(profile.avatar)
      setTitle(profile.title || '')
      setBio(profile.bio || '')
      setAlias(profile.alias || '')
      setCompanyId(profile.organisation?.or_id || '')

      // Only educationDegrees are shown and education levels that don't have any degrees
      // To force users to choose the most specific option available
      setLoms(compact(profile?.loms?.map((lom: Avo.Lom.Lom) => lom.lom)) || [])
    }
  }, [profile])

  const navigateBack = () => {
    navigate(navigateFunc, USER_PATH.USER_DETAIL, {
      id: profileId,
    })
  }

  const handleSave = async () => {
    if (!profile) {
      return
    }

    try {
      setIsSaving(true)

      const newProfileInfo = {
        firstName,
        lastName,
        alias,
        title,
        bio,
        userId: profile.userId,
        avatar: avatar || null,
        loms: loms.map((lom) => ({
          lom_id: lom.id,
          profile_id: profile?.profileId,
        })),
        company_id: companyId || null,
      }

      try {
        await SettingsService.updateProfileInfo(
          newProfileInfo as unknown as Avo.User.UpdateProfileValues,
        )
      } catch (err) {
        setIsSaving(false)

        if (JSON.stringify(err).includes('DUPLICATE_ALIAS')) {
          ToastService.danger(
            tText(
              'settings/components/profile___deze-schermnaam-is-reeds-in-gebruik',
            ),
          )
          setProfileErrors({
            alias: tText(
              'settings/components/profile___schermnaam-is-reeds-in-gebruik',
            ),
          })
          return
        }

        throw err
      }

      redirectToClientPage(
        buildLink(USER_PATH.USER_DETAIL, { id: profileId }),
        navigateFunc,
      )

      ToastService.success(
        tText('admin/users/views/user-edit___de-gebruiker-is-aangepast'),
      )
    } catch (err) {
      console.error(
        new CustomError('Failed to save user', err, {
          profile,
        }),
      )

      ToastService.danger(
        tText(
          'admin/users/views/user-edit___het-opslaan-van-de-gebruiker-is-mislukt',
        ),
      )
    }
    setIsSaving(false)
  }

  const renderUserEdit = () => {
    if (isLoading) {
      return <FullPageSpinner />
    }

    const companyLogo = profile?.organisation?.logo_url || null

    if (profile) {
      return (
        <Container mode="horizontal">
          <Box backgroundColor="gray">
            <Form>
              <FormGroup
                label={tText('admin/users/views/user-detail___avatar')}
              >
                {!companyId && !!profileId && (
                  <FileUpload
                    urls={avatar ? [avatar] : []}
                    onChange={(urls) => setAvatar(urls[0])}
                    assetType="PROFILE_AVATAR"
                    allowMulti={false}
                    allowedTypes={PHOTO_TYPES}
                    ownerId={profileId}
                  />
                )}
                {!!companyId && !!companyLogo && (
                  <div
                    className="c-logo-preview"
                    style={{
                      backgroundImage: `url(${companyLogo})`,
                    }}
                  />
                )}
                {!!companyId && !companyLogo && 'geen avatar'}
              </FormGroup>

              <FormGroup
                label={tText('admin/users/views/user-detail___functie')}
              >
                <TextInput value={title} onChange={setTitle} />
              </FormGroup>
              <FormGroup label={tText('admin/users/views/user-detail___bio')}>
                <TextArea value={bio} onChange={setBio} />
              </FormGroup>
              <FormGroup
                label={tText('admin/users/views/user-detail___gebruikersnaam')}
                error={profileErrors.alias}
              >
                <TextInput value={alias} onChange={setAlias} />
              </FormGroup>
              <LomFieldsInput loms={loms} onChange={setLoms} />
            </Form>
          </Box>
        </Container>
      )
    }
  }

  const renderUserEditPage = () => {
    return (
      <AdminLayout
        size="large"
        pageTitle={tText('admin/users/views/user-edit___bewerk-gebruiker')}
        onClickBackButton={navigateBack}
      >
        <AdminLayoutTopBarRight>
          <ButtonToolbar>
            <Button
              label={tText(
                'admin/user-groups/views/user-group-edit___annuleer',
              )}
              onClick={navigateBack}
              type="tertiary"
            />
            <Button
              disabled={isSaving}
              label={tText('admin/user-groups/views/user-group-edit___opslaan')}
              onClick={handleSave}
            />
          </ButtonToolbar>
        </AdminLayoutTopBarRight>

        <AdminLayoutBody>{renderUserEdit()}</AdminLayoutBody>
      </AdminLayout>
    )
  }

  return (
    <>
      <PermissionGuard permissions={[PermissionName.VIEW_USERS]}>
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              profile?.fullName,
              tText('admin/users/views/user-detail___item-detail-pagina-titel'),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'admin/users/views/user-detail___gebruikersbeheer-detail-pagina-beschrijving',
            )}
          />
        </Helmet>

        {renderUserEditPage()}
      </PermissionGuard>
    </>
  )
}

export default UserEditPage
