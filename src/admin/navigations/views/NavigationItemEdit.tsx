import { type FC, lazy, Suspense } from 'react'
import { Helmet } from 'react-helmet'
import { useNavigate, useParams } from 'react-router'

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { buildLink } from '../../../shared/helpers/build-link';
import { goBrowserBackWithFallback } from '../../../shared/helpers/go-browser-back-with-fallback';
import { tText } from '../../../shared/helpers/translate-text';
import { ADMIN_PATH } from '../../admin.const';

import './NavigationItemEdit.scss'

import { PermissionName } from '@viaa/avo2-types'

const NavigationEdit = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.NavigationItemEdit,
  })),
)

const NavigationItemEdit: FC = () => {
  const navigateFunc = useNavigate()
  const { navigationBarId, navigationItemId } = useParams<{
    navigationBarId: string
    navigationItemId: string
  }>()

  // Render
  return (
    <PermissionGuard permissions={[PermissionName.EDIT_NAVIGATION_BARS]}>
      <div className="c-admin__navigation-edit">
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              tText(
                'admin/navigations/views/navigation-item-edit___navigation-item-edit-page-title',
              ),
              navigationItemId
                ? tText(
                    'admin/menu/views/menu-edit___menu-item-beheer-bewerk-pagina-titel',
                  )
                : tText(
                    'admin/menu/views/menu-edit___menu-item-beheer-aanmaak-pagina-titel',
                  ),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'admin/navigations/views/navigation-item-edit___navigation-item-edit-page-description',
            )}
          />
        </Helmet>

        <Suspense fallback={<FullPageSpinner />}>
          <NavigationEdit
            navigationBarId={navigationBarId as string}
            navigationItemId={navigationItemId}
            onGoBack={() =>
              goBrowserBackWithFallback(
                buildLink(ADMIN_PATH.NAVIGATIONS_DETAIL, { navigationBarId }),
                navigateFunc,
              )
            }
          />
        </Suspense>
      </div>
    </PermissionGuard>
  )
}

export default NavigationItemEdit
