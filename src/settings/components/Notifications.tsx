import React, { type FC } from 'react'
import { Helmet } from 'react-helmet'

import { GENERATE_SITE_TITLE } from '../../constants';
import { tText } from '../../shared/helpers/translate-text';

export const Notifications: FC = () => {
  return (
    <>
      <Helmet>
        <title>
          {GENERATE_SITE_TITLE(
            tText(
              'settings/components/notifications___notificatie-voorkeuren-pagina-titel',
            ),
          )}
        </title>
        <meta
          name="description"
          content={tText(
            'settings/components/notifications___notificatie-voorkeuren-pagina-beschrijving',
          )}
        />
      </Helmet>
      <span>TODO notificaties</span>
    </>
  )
}
