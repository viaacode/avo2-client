import { type FC } from 'react';

import { GENERATE_SITE_TITLE } from '../../constants';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tText } from '../../shared/helpers/translate-text';

export const Notifications: FC = () => {
  return (
    <>
      <SeoMetadata
        title={GENERATE_SITE_TITLE(
          tText(
            'settings/components/notifications___notificatie-voorkeuren-pagina-titel',
          ),
        )}
        description={tText(
          'settings/components/notifications___notificatie-voorkeuren-pagina-beschrijving',
        )}
      />
      <span>TODO notificaties</span>
    </>
  );
};
