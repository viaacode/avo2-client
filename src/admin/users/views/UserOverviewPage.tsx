import { PermissionName } from '@viaa/avo2-types';
import { type FC, lazy, Suspense } from 'react';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata';
import { tText } from '../../../shared/helpers/translate-text';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';

const UserOverview = lazy(() =>
  import('@meemoo/admin-core-ui/admin').then((adminCoreModule) => ({
    default: adminCoreModule.UserOverview,
  })),
);

export const UserOverviewPage: FC = () => {
  return (
    <PermissionGuard permissions={[PermissionName.VIEW_USERS]}>
      <AdminLayout
        pageTitle={tText('admin/users/views/user-overview___gebruikers')}
        size="full-width"
      >
        <AdminLayoutBody>
          <SeoMetadata
            title={tText(
              'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-titel',
            )}
            description={tText(
              'admin/users/views/user-overview___gebruikersbeheer-overzicht-pagina-beschrijving',
            )}
          />

          <Suspense
            fallback={
              <FullPageSpinner locationId="user-overview-page--loading" />
            }
          >
            <UserOverview />
          </Suspense>
        </AdminLayoutBody>
      </AdminLayout>
    </PermissionGuard>
  );
};

export default UserOverviewPage;
