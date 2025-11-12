import { Button } from '@viaa/avo2-components'
import { PermissionName } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import React, { type FC, lazy, Suspense, useCallback } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate } from 'react-router'

import { commonUserAtom } from '../../../authentication/authentication.store.js'
import { PermissionGuard } from '../../../authentication/components/PermissionGuard.js'
import { GENERATE_SITE_TITLE } from '../../../constants.js'
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { tText } from '../../../shared/helpers/translate-text.js'
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout.js'
import {
  AdminLayoutBody,
  AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots.js'
import { CONTENT_PAGE_PATH } from '../content-page.consts.js'

import './ContentPage.scss'

const ContentPageOverview = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.ContentPageOverview,
  })),
)

const { CREATE_CONTENT_PAGES } = PermissionName

export const ContentPageOverviewPage: FC = () => {
  const navigateFunc = useNavigate()
  const commonUser = useAtomValue(commonUserAtom)

  const hasPerm = useCallback(
    (permission: PermissionName) =>
      commonUser?.permissions?.includes(permission),
    [commonUser],
  )

  const renderPageContent = () => {
    return (
      <Suspense fallback={<FullPageSpinner />}>
        <ContentPageOverview commonUser={commonUser} />
      </Suspense>
    )
  }

  return (
    <PermissionGuard
      permissions={[
        PermissionName.EDIT_OWN_CONTENT_PAGES,
        PermissionName.EDIT_ANY_CONTENT_PAGES,
      ]}
    >
      <AdminLayout
        pageTitle={tText(
          'admin/content-page/views/content-page-overview-page___contentoverzicht',
        )}
        className="c-admin-core c-admin-core__content-page"
        size="full-width"
      >
        <AdminLayoutTopBarRight>
          {hasPerm(CREATE_CONTENT_PAGES) && (
            <Button
              label={tText(
                'admin/content/views/content-overview___content-toevoegen',
              )}
              title={tText(
                'admin/content/views/content-overview___maak-een-nieuwe-content-pagina-aan',
              )}
              onClick={() =>
                navigateFunc(CONTENT_PAGE_PATH.CONTENT_PAGE_CREATE)
              }
            />
          )}
        </AdminLayoutTopBarRight>
        <AdminLayoutBody>
          <Helmet>
            <title>
              {GENERATE_SITE_TITLE(
                tText(
                  'admin/content-page/views/content-page-overview-page___contentpaginas-beheer',
                ),
              )}
            </title>
            <meta
              name="description"
              content={tText(
                'admin/content-page/views/content-page-overview-page___contentbeheer-beheer-content-paginas-via-dit-overzicht',
              )}
            />
          </Helmet>
          {renderPageContent()}
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  )
}

export default ContentPageOverviewPage
