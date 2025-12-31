import { PermissionName } from '@viaa/avo2-types';
import { type FC, lazy, Suspense } from 'react';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';

import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { tText } from '../../../shared/helpers/translate-text';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';

import './NavigationBarOverviewPage.scss';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata.tsx';

const NavigationOverview = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.NavigationBarOverview,
  })),
);

export const NavigationBarOverviewPage: FC = () => {
  const title = tText('admin/menu/views/menu-overview___navigatie-overzicht');
  return (
    <PermissionGuard permissions={[PermissionName.EDIT_NAVIGATION_BARS]}>
      <AdminLayout pageTitle={title} size="full-width">
        <AdminLayoutBody>
          <SeoMetadata
            title={tText(
              'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-titel',
            )}
            description={tText(
              'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-beschrijving',
            )}
          />
          <Suspense
            fallback={
              <FullPageSpinner locationId="navigation-bar-overview-page--loading" />
            }
          >
            <NavigationOverview />
          </Suspense>
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  );
};

export default NavigationBarOverviewPage;
