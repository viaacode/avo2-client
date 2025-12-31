import { type FC } from 'react';
import { SeoMetadata } from '../../shared/components/SeoMetadata/SeoMetadata.tsx';
import { tText } from '../../shared/helpers/translate-text';

export const Notifications: FC = () => {
  return (
    <>
      <SeoMetadata
        title={tText(
          'settings/components/notifications___notificatie-voorkeuren-pagina-titel',
        )}
        description={tText(
          'settings/components/notifications___notificatie-voorkeuren-pagina-beschrijving',
        )}
      />
      <span>TODO notificaties</span>
    </>
  );
};
