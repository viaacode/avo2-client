import React from 'react'
import { Helmet } from 'react-helmet'

import { GENERATE_SITE_TITLE } from '../../../constants.js'
import { tHtml } from '../../../shared/helpers/translate-html.js'
import { tText } from '../../../shared/helpers/translate-text.js'
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout.js'
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots.js'

export const Dashboard = () => {
  return (
    <AdminLayout
      pageTitle={tText('admin/dashboard/views/dashboard___dashboard')}
      size="large"
    >
      <AdminLayoutBody>
        <Helmet>
          <title>
            {GENERATE_SITE_TITLE(
              tText(
                'admin/dashboard/views/dashboard___beheer-dashboard-pagina-titel',
              ),
            )}
          </title>
          <meta
            name="description"
            content={tText(
              'admin/dashboard/views/dashboard___beheer-dashboard-pagina-beschrijving',
            )}
          />
        </Helmet>
        <p>
          {tHtml(
            'admin/dashboard/views/dashboard___introductie-beheer-dashboard',
          )}
        </p>
      </AdminLayoutBody>
    </AdminLayout>
  )
}

export default Dashboard
