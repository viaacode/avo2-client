import { useAtomValue } from 'jotai';
import { type FC, useEffect } from 'react';
import { Outlet } from 'react-router';
import { useLocation } from 'react-router-dom';
import FullPageSpinner from '../../shared/components/FullPageSpinner/FullPageSpinner.tsx';
import { loginAtom } from '../authentication.store.ts';
import { logoutAndRedirectToLogin } from '../helpers/redirects/redirects.ts';

export const EnsureUserLoggedIn: FC = () => {
  const loginState = useAtomValue(loginAtom);
  const location = useLocation();

  useEffect(() => {
    if (loginState?.data?.message === 'LOGGED_OUT') {
      logoutAndRedirectToLogin(location);
    }
  }, [loginState?.data?.message]);

  if (!loginState || loginState.loading) {
    return <FullPageSpinner locationId="EnsureUserLoggedIn" />;
  }
  if (loginState.data?.message === 'LOGGED_IN') {
    return <Outlet />;
  }

  // Still loading/determining state - show spinner
  return <FullPageSpinner locationId="EnsureUserLoggedIn-pending" />;
};

export default EnsureUserLoggedIn;
