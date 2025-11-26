import React, { type FC } from 'react';
import { useBlocker } from 'react-router-dom';

import { ROUTE_PARTS } from '../../constants/routes';
import { tText } from '../../helpers/translate-text';
import { ConfirmModal } from '../ConfirmModal/ConfirmModal';

export const BeforeUnloadPrompt: FC<{ when: boolean; message?: string }> = ({
  when,
  message,
}) => {
  const blocker = useBlocker(({ currentLocation, nextLocation }) => {
    // Form has no unsaved changes => do not show the "before unload" message
    if (!when) {
      return false;
    }

    // Same page url => do not show the "before unload" message
    if (currentLocation.pathname === nextLocation.pathname) {
      return false;
    }

    // Specific tab on the same edit page => do not show the "before unload" message
    // eg: APP_PATH.COLLECTION_EDIT_TAB
    // eg: APP_PATH.BUNDLE_EDIT_TAB
    // eg: APP_PATH.ASSIGNMENT_EDIT_TAB
    const currentRouteWithoutTab =
      currentLocation.pathname.split(`/${ROUTE_PARTS.edit}/`)[0] +
      `/${ROUTE_PARTS.edit}`;
    const nextRouteWithoutTab =
      nextLocation.pathname.split(`/${ROUTE_PARTS.edit}/`)[0] +
      `/${ROUTE_PARTS.edit}`;
    if (currentRouteWithoutTab === nextRouteWithoutTab) {
      return false;
    }

    return true;
  });

  if (blocker.state !== 'blocked') {
    return null;
  }
  return (
    <ConfirmModal
      isOpen={true}
      title={tText(
        'shared/components/before-unload-prompt/before-unload-prompt___ben-je-zeker-dat-je-de-pagina-wilt-verlaten',
      )}
      body={
        message ||
        tText(
          'shared/components/before-unload-prompt/before-unload-prompt___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten',
        )
      }
      confirmCallback={() => blocker.proceed()}
      onClose={() => blocker.reset()}
      confirmLabel={tText(
        'shared/components/before-unload-prompt/before-unload-prompt___verlaten',
      )}
      cancelLabel={tText(
        'shared/components/before-unload-prompt/before-unload-prompt___blijven',
      )}
    />
  );
};
