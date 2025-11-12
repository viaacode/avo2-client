import {
  Button,
  ButtonToolbar,
  Column,
  Container,
  Form,
  FormGroup,
  Grid,
  IconName,
  Select,
  TextInput,
} from '@viaa/avo2-components'
import { PermissionName } from '@viaa/avo2-types'
import React, { type FC, useEffect, useState } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useParams } from 'react-router'

import { PermissionGuard } from '../../../authentication/components/PermissionGuard.js'
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page.js'
import { GENERATE_SITE_TITLE } from '../../../constants.js'
import { ErrorView } from '../../../error/views/ErrorView.js'
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { ROUTE_PARTS } from '../../../shared/constants/index.js'
import { buildLink } from '../../../shared/helpers/build-link.js'
import { CustomError } from '../../../shared/helpers/custom-error.js'
import { navigate } from '../../../shared/helpers/link.js'
import { tHtml } from '../../../shared/helpers/translate-html.js'
import { tText } from '../../../shared/helpers/translate-text.js'
import { ToastService } from '../../../shared/services/toast-service.js'
import { ADMIN_PATH } from '../../admin.const.js'
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout.js'
import {
  AdminLayoutBody,
  AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots.js'
import { PROXY_PATH_SHORTCUT } from '../helpers/replace-proxy-url-template-with-url.js'
import { useCreateUrlRedirect } from '../hooks/useCreateUrlRedirect.js'
import { useGetUrlRedirectById } from '../hooks/useGetUrlRedirectById.js'
import { useUpdateUrlRedirect } from '../hooks/useUpdateUrlRedirect.js'
import {
  INITIAL_URL_REDIRECT,
  URL_REDIRECT_PATH,
  URL_REDIRECT_PATTERN_OPTIONS,
} from '../url-redirects.const.js'
import {
  type UrlRedirect,
  type UrlRedirectEditFormErrorState,
  type UrlRedirectPathPattern,
} from '../url-redirects.types.js'

const UrlRedirectEdit: FC = () => {
  const { id } = useParams<{ id: string }>()

  const navigateFunc = useNavigate()

  const [formErrors, setFormErrors] = useState<UrlRedirectEditFormErrorState>(
    {},
  )
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [updatedUrlRedirect, setUpdatedUrlRedirect] = useState<UrlRedirect>(
    INITIAL_URL_REDIRECT(),
  )

  const isCreatePage: boolean = location.pathname.includes(
    `/${ROUTE_PARTS.create}`,
  )
  const urlRedirectId = parseInt(id as string, 10)

  const { mutateAsync: createUrlRedirect } = useCreateUrlRedirect()
  const { mutateAsync: updateUrlRedirect } = useUpdateUrlRedirect()
  const {
    data: loadedUrlRedirect,
    isLoading,
    error,
  } = useGetUrlRedirectById(urlRedirectId)

  useEffect(() => {
    if (loadedUrlRedirect) {
      setUpdatedUrlRedirect(loadedUrlRedirect)
    }
  }, [loadedUrlRedirect])

  const navigateBack = () => {
    navigateFunc(URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW)
  }

  const getFormErrors = (): UrlRedirectEditFormErrorState | null => {
    if (!updatedUrlRedirect?.oldPath) {
      return {
        old_path: tText(
          'admin/url-redirects/views/url-redirect-edit___een-oude-url-is-verplicht',
        ),
      }
    } else if (!updatedUrlRedirect.oldPath.startsWith('/')) {
      return {
        old_path: tText(
          'admin/url-redirects/views/url-redirect-edit___de-url-moet-starten-met',
        ),
      }
    }

    if (!updatedUrlRedirect?.newPath) {
      return {
        new_path: tText(
          'admin/url-redirects/views/url-redirect-edit___een-nieuwe-url-is-verplicht',
        ),
      }
    } else if (
      !(
        updatedUrlRedirect.newPath.startsWith('/') ||
        updatedUrlRedirect.newPath.startsWith(PROXY_PATH_SHORTCUT)
      )
    ) {
      return {
        new_path: tText(
          'admin/url-redirects/views/url-redirect-edit___de-url-moet-starten-met-of-proxy-url',
        ),
      }
    }
    return null
  }

  const handleSave = async () => {
    try {
      const errors = getFormErrors()
      setFormErrors(errors || {})
      if (errors) {
        ToastService.danger(
          tHtml(
            'admin/url-redirects/views/url-redirect-edit___de-invoer-is-ongeldig',
          ),
        )
        return
      }

      setIsSaving(true)

      if (isCreatePage) {
        await createUrlRedirect(updatedUrlRedirect)
      } else {
        await updateUrlRedirect(updatedUrlRedirect)
      }

      redirectToClientPage(
        buildLink(URL_REDIRECT_PATH.URL_REDIRECT_OVERVIEW),
        navigateFunc,
      )
      ToastService.success(
        tHtml(
          'admin/url-redirects/views/url-redirect-edit___de-url-redirect-is-opgeslagen',
        ),
      )
    } catch (err) {
      console.error(
        new CustomError('Failed to save url redirect', err, {
          updatedUrlRedirect,
        }),
      )

      ToastService.danger(
        (err as CustomError)?.additionalInfo?.errorMessage ||
          tHtml(
            'admin/url-redirects/views/url-redirect-edit___het-opslaan-van-de-url-redirect-is-mislukt',
          ),
      )
    }
    setIsSaving(false)
  }

  const renderEditPage = () => {
    if (isLoading) {
      return <FullPageSpinner />
    }

    if (error || !loadedUrlRedirect) {
      return (
        <ErrorView
          message={tHtml(
            'admin/url-redirects/views/url-redirect-edit___het-ophalen-van-de-url-redirect-is-mislukt',
          )}
          icon={IconName.alertTriangle}
        />
      )
    }

    return (
      <Container size="medium">
        <Form>
          <Grid>
            <Column size="7">
              <FormGroup
                label={tText(
                  'admin/url-redirects/views/url-redirect-edit___oude-url',
                )}
                error={formErrors.old_path}
                required
              >
                <TextInput
                  value={updatedUrlRedirect.oldPath || ''}
                  onChange={(newValue: string) =>
                    setUpdatedUrlRedirect({
                      ...updatedUrlRedirect,
                      oldPath: newValue,
                    })
                  }
                />
              </FormGroup>
            </Column>
            <Column size="5">
              <FormGroup
                label={tText(
                  'admin/url-redirects/views/url-redirect-edit___oude-url-patroon',
                )}
                error={formErrors.oldPathPattern}
              >
                <Select
                  options={URL_REDIRECT_PATTERN_OPTIONS()}
                  value={updatedUrlRedirect.oldPathPattern}
                  onChange={(newContentType) =>
                    setUpdatedUrlRedirect({
                      ...updatedUrlRedirect,
                      oldPathPattern: newContentType as UrlRedirectPathPattern,
                    })
                  }
                />
              </FormGroup>
            </Column>
          </Grid>
          <FormGroup
            label={tText(
              'admin/url-redirects/views/url-redirect-edit___nieuwe-url',
            )}
            error={formErrors.new_path}
            required
          >
            <TextInput
              value={updatedUrlRedirect.newPath || ''}
              onChange={(newValue: string) =>
                setUpdatedUrlRedirect({
                  ...updatedUrlRedirect,
                  newPath: newValue,
                })
              }
            />
          </FormGroup>
        </Form>
      </Container>
    )
  }

  // Render
  const renderPage = () => {
    return (
      <AdminLayout
        onClickBackButton={() =>
          navigate(navigateFunc, ADMIN_PATH.URL_REDIRECT_OVERVIEW)
        }
        pageTitle={
          isCreatePage
            ? tText(
                'admin/url-redirects/views/url-redirect-edit___url-redirect-aanmaken',
              )
            : tText(
                'admin/url-redirects/views/url-redirect-edit___url-redirect-aanpassen',
              )
        }
        size="full-width"
      >
        <AdminLayoutTopBarRight>
          <ButtonToolbar>
            <Button
              label={tText(
                'admin/url-redirects/views/url-redirect-edit___annuleer',
              )}
              onClick={navigateBack}
              type="secondary"
            />
            <Button
              disabled={isLoading || !!error || isSaving}
              label={tText(
                'admin/url-redirects/views/url-redirect-edit___opslaan',
              )}
              onClick={handleSave}
              type="primary"
            />
          </ButtonToolbar>
        </AdminLayoutTopBarRight>
        <AdminLayoutBody>{renderEditPage()}</AdminLayoutBody>
      </AdminLayout>
    )
  }

  return (
    <>
      <PermissionGuard permissions={[PermissionName.EDIT_REDIRECTS]}>
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              isCreatePage
                ? tText(
                    'admin/url-redirects/views/url-redirect-edit___url-redirect-beheer-aanmaak-pagina-titel',
                  )
                : tText(
                    'admin/url-redirects/views/url-redirect-edit___url-redirect-beheer-bewerk-pagina-titel',
                  ),
            )}
          </title>
          <meta
            name="description"
            content={
              isCreatePage
                ? tText(
                    'admin/url-redirects/views/url-redirect-edit___url-redirect-beheer-aanmaak-pagina-beschrijving',
                  )
                : tText(
                    'admin/url-redirects/views/url-redirect-edit___url-redirect-beheer-bewerk-pagina-beschrijving',
                  )
            }
          />
        </Helmet>
        {renderPage()}
      </PermissionGuard>
    </>
  )
}

export default UrlRedirectEdit
