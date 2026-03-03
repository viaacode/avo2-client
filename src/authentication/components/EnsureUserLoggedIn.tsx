import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, useEffect } from 'react';
import { Outlet } from 'react-router';
import FullPageSpinner from '../../shared/components/FullPageSpinner/FullPageSpinner.tsx';
import { getLoginStateAtom } from '../authentication.store.actions.tsx';
import { loginAtom } from '../authentication.store.ts';
import { logoutAndRedirectToLogin } from '../helpers/redirects/redirects.ts';

export const EnsureUserLoggedIn: FC = () => {
  const loginState = useAtomValue(loginAtom);
  const getLoginState = useSetAtom(getLoginStateAtom);

  useEffect(() => {
    getLoginState(false);
  }, []);

  useEffect(() => {
    if (loginState?.data?.message === 'LOGGED_OUT') {
      console.log('User is not logged in, redirecting to login page');
      logoutAndRedirectToLogin();
    }
  }, [loginState]);

  if (!loginState || loginState.loading) {
    return <FullPageSpinner locationId="EnsureUserLoggedIn" />;
  }
  if (loginState.data?.message === 'LOGGED_IN') {
    return <Outlet />;
  }
};

export default EnsureUserLoggedIn;
