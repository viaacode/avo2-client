import { PermissionName } from '@viaa/avo2-types'
import React, { type FC, lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet'

import { PermissionGuard } from '../../../authentication/components/PermissionGuard.js'
import { GENERATE_SITE_TITLE } from '../../../constants.js'
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { tText } from '../../../shared/helpers/translate-text.js'
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout.js'
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots.js'

const UserOverview = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.UserOverview,
  })),
)

export const UserOverviewPage: FC = () => {
  return (
    <PermissionGuard permissions={[PermissionName.VIEW_USERS]}>
      <AdminLayout
        pageTitle={tText('admin/users/views/user-overview___gebruikers')}
        size="full-width"
      >
        <AdminLayoutBody>
          <Helmet>
            <title>
              {GENERATE_SITE_TITLE(
                tText(
                  'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-titel',
                ),
              )}
            </title>
            <meta
              name="description"
              content={tText(
                'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-beschrijving',
              )}
            />
          </Helmet>

          <Suspense fallback={<FullPageSpinner />}>
            <UserOverview />
          </Suspense>
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  )
}

export default UserOverviewPage
