import { PermissionName } from '@viaa/avo2-types'
import { type FC, lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet'

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { GENERATE_SITE_TITLE } from '../../../constants';

import './NavigationBarOverview.scss'
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { tText } from '../../../shared/helpers/translate-text';

const NavigationOverview = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.NavigationBarOverview,
  })),
)

export const NavigationBarOverview: FC = () => {
  return (
    <PermissionGuard permissions={[PermissionName.EDIT_NAVIGATION_BARS]}>
      <div className="c-admin__navigation-overview">
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              tText(
                'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-titel',
              ),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-beschrijving',
            )}
          />
        </Helmet>
        <Suspense fallback={<FullPageSpinner />}>
          <NavigationOverview />
        </Suspense>
      </div>
    </PermissionGuard>
  )
}

export default NavigationBarOverview
