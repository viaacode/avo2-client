import { PermissionName } from '@viaa/avo2-types';
import { type FC, lazy, Suspense } from 'react';
import { Helmet } from 'react-helmet';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { GENERATE_SITE_TITLE } from '../../../constants';

import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { tText } from '../../../shared/helpers/translate-text';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';

import './NavigationBarOverviewPage.scss';

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
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  );
};

export default NavigationBarOverviewPage;
