import { type PermissionName } from '@viaa/avo2-types';
import { useAtomValue } from 'jotai';
import { useEffect, useState } from 'react';

import { commonUserAtom } from '../../authentication/authentication.store';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { tHtml } from '../helpers/translate-html';
import { ToastService } from '../services/toast-service';

/**
 * Checks if the currently logged in user has the given permission.
 * Returns null while the check is still pending.
 */
export function useHasPermission(permission: PermissionName): boolean | null {
  const commonUser = useAtomValue(commonUserAtom);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    PermissionService.hasPermission(permission, null, commonUser)
      .then(setHasPermission)
      .catch((err) => {
        console.error('Failed to check permission for the current user', err, {
          commonUser,
          permission,
        });
        ToastService.danger(
          tHtml(
            'collection/components/fragment/fragment-edit___het-controleren-van-je-account-rechten-is-mislukt',
          ),
        );
      });
  }, [commonUser, permission]);

  return hasPermission;
}
