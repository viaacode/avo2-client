import { useSlot } from '@viaa/avo2-components';
import { AvoAuthLoginResponseLoggedIn, AvoUserCommonUser, type PermissionName } from '@viaa/avo2-types';
import { isNil } from 'es-toolkit';
import { useAtomValue } from 'jotai';
import { stringifyUrl } from 'query-string';
import { type FC, type ReactNode, useEffect, useState } from 'react';
import { useNavigate } from 'react-router';

import { APP_PATH } from '../../constants';
import { checkLoginState } from '../../embed/hooks/useGetLoginStateForEmbed.ts';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { renderWrongUserRoleError } from '../../shared/helpers/render-wrong-user-role-error';
import { loginAtom } from '../authentication.store';
import { PermissionService } from '../helpers/permission-service';
import { redirectToClientPage } from '../helpers/redirects/redirects';
import { PermissionGuardFail, PermissionGuardPass, } from './PermissionGuard.slots';

interface PermissionGuardProps {
  children: ReactNode;
  permissions: PermissionName[];
}

interface LoggedInGuardProps {
  children: ReactNode;
  hasToBeLoggedIn: boolean;
}

export const PermissionGuard: FC<PermissionGuardProps | LoggedInGuardProps> = (
  props,
) => {
  const { children } = props;
  const permissions = (props as PermissionGuardProps).permissions || [];
  const hasToBeLoggedIn =
    (props as LoggedInGuardProps).hasToBeLoggedIn || false;
  const loginStatus = useAtomValue(loginAtom);
  const commonUser: AvoUserCommonUser | undefined = (
    loginStatus?.data as AvoAuthLoginResponseLoggedIn | undefined
  )?.commonUserInfo;
  const navigateFunc = useNavigate();

  const childrenIfPassed = useSlot(PermissionGuardPass, children);
  const childrenIfFailed = useSlot(PermissionGuardFail, children);

  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  useEffect(() => {
    PermissionService.hasPermissions(permissions, commonUser)
      .then((response) => {
        setHasPermission(response);
      })
      .catch((err) => {
        console.error('Failed to get permissions', err, {
          permissions,
          commonUser,
        });
      });
  });

  useEffect(() => {
    if (!loginStatus.loading && !loginStatus.data) {
      // trigger login check
      checkLoginState();
    } else if (
      !loginStatus.loading &&
      loginStatus?.data?.message === 'LOGGED_OUT'
    ) {
      redirectToClientPage(
        stringifyUrl({
          url: APP_PATH.REGISTER_OR_LOGIN.route,
          query: {
            returnToUrl: location.href,
          },
        }),
        navigateFunc,
      );
    }
  }, [commonUser, loginStatus.loading, navigateFunc]);

  const renderSuccess = () => {
    return childrenIfPassed ? childrenIfPassed : children;
  };

  const renderFailure = () => {
    return childrenIfFailed ? childrenIfFailed : renderWrongUserRoleError();
  };

  if (!loginStatus.data || isNil(hasPermission)) {
    return <FullPageSpinner locationId="permission-guard--loading" />;
  }
  if (hasToBeLoggedIn && !commonUser) {
    return renderFailure();
  }
  if (permissions.length && !hasPermission) {
    return renderFailure();
  }
  return renderSuccess();
};
