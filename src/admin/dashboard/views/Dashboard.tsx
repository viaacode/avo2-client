import { SeoMetadata } from '../../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';

export const Dashboard = () => {
  return (
    <AdminLayout
      pageTitle={tText('admin/dashboard/views/dashboard___dashboard')}
      size="large"
    >
      <AdminLayoutBody>
        <SeoMetadata
          title={tText(
            'admin/dashboard/views/dashboard___beheer-dashboard-pagina-titel',
          )}
          description={tText(
            'admin/dashboard/views/dashboard___beheer-dashboard-pagina-beschrijving',
          )}
        />
        <p>
          {tHtml(
            'admin/dashboard/views/dashboard___introductie-beheer-dashboard',
          )}
        </p>
      </AdminLayoutBody>
    </AdminLayout>
  );
};

export default Dashboard;
