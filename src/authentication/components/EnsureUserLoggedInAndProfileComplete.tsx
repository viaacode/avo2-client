import { useAtomValue } from 'jotai';
import { type FC, useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';
import { APP_PATH } from '../../constants.ts';
import FullPageSpinner from '../../shared/components/FullPageSpinner/FullPageSpinner.tsx';
import { loginAtom } from '../authentication.store.ts';
import { isProfileComplete } from '../helpers/get-profile-info.ts';
import {
  logoutAndRedirectToLogin,
  redirectToClientPage,
} from '../helpers/redirects/redirects.ts';

export const EnsureUserLoggedInAndProfileComplete: FC = () => {
  const loginState = useAtomValue(loginAtom);
  const location = useLocation();
  const navigate = useNavigate();

  /**
   * Logout & redirect to the login page when we're logged out on the server
   */
  useEffect(() => {
    if (loginState?.data?.message === 'LOGGED_OUT') {
      logoutAndRedirectToLogin(location);
    }
  }, [loginState?.data?.message]);

  /**
   * Redirect to complete profile page
   */
  useEffect(() => {
    if (
      loginState?.data?.message === 'LOGGED_IN' &&
      !(
        isProfileComplete(loginState.data?.commonUserInfo) ||
        location.pathname === APP_PATH.COMPLETE_PROFILE.route
      )
    ) {
      redirectToClientPage(APP_PATH.COMPLETE_PROFILE.route, navigate);
    }
  }, [loginState?.data, location.pathname]);

  if (!loginState || loginState.loading) {
    return (
      <FullPageSpinner locationId="EnsureUserLoggedInAndProfileComplete" />
    );
  }
  if (loginState.data?.message === 'LOGGED_IN') {
    if (
      isProfileComplete(loginState.data?.commonUserInfo) ||
      location.pathname === APP_PATH.COMPLETE_PROFILE.route
    ) {
      return <Outlet />;
    } else {
      return (
        <FullPageSpinner locationId="EnsureUserLoggedInAndProfileComplete-redirecting" />
      );
    }
  }

  // Still loading/determining state - show spinner
  return (
    <FullPageSpinner locationId="EnsureUserLoggedInAndProfileComplete-pending" />
  );
};

export default EnsureUserLoggedInAndProfileComplete;
