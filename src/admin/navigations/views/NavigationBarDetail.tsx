import { PermissionName } from '@viaa/avo2-types'
import React, { type FC, lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useParams } from 'react-router'

import { PermissionGuard } from '../../../authentication/components/PermissionGuard.js'
import { GENERATE_SITE_TITLE } from '../../../constants.js'
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner.js'
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback.js'
import { tText } from '../../../shared/helpers/translate-text.js'
import { ADMIN_PATH } from '../../admin.const.js'

import './NavigationBarDetail.scss'

const NavigationDetail = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.NavigationBarDetail,
  })),
)

const NavigationBarDetail: FC = () => {
  const navigateFunc = useNavigate()
  const { navigationBarId } = useParams<{ navigationBarId: string }>()

  return (
    <PermissionGuard permissions={[PermissionName.EDIT_NAVIGATION_BARS]}>
      <div className="c-admin__navigation-detail">
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              navigationBarId,
              tText(
                'admin/menu/views/menu-detail___menu-beheer-detail-pagina-titel',
              ),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'admin/menu/views/menu-detail___menu-beheer-detail-pagina-beschrijving',
            )}
          />
        </Helmet>
        <Suspense fallback={<FullPageSpinner />}>
          {!!navigationBarId && (
            <NavigationDetail
              navigationBarId={navigationBarId}
              onGoBack={() =>
                goBrowserBackWithFallback(
                  ADMIN_PATH.NAVIGATIONS_OVERVIEW,
                  navigateFunc,
                )
              }
            />
          )}
        </Suspense>
      </div>
    </PermissionGuard>
  )
}

export default NavigationBarDetail
