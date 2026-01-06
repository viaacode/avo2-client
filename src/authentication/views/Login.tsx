import { Button, IconName } from '@viaa/avo2-components';
import { useAtomValue, useSetAtom } from 'jotai';
import { type FC, useEffect } from 'react';
import { useNavigate } from 'react-router';
import { useLocation } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views/ErrorView';
import { FullPageSpinner } from '../../shared/components/FullPageSpinner/FullPageSpinner';
import { isPupil } from '../../shared/helpers/is-pupil';
import { tText } from '../../shared/helpers/translate-text';
import { loginAtom } from '../authentication.store';
import { getLoginStateAtom } from '../authentication.store.actions';
import { LoginMessage } from '../authentication.types';
import { redirectToServerLoginPage } from '../helpers/redirects/redirects';

const LOGIN_ATTEMPT_KEY = 'AVO_LOGIN_ATTEMPT';

export const Login: FC = () => {
  const location = useLocation();
  const navigateFunc = useNavigate();

  const loginAtomValue = useAtomValue(loginAtom);
  const loginState = loginAtomValue.data;
  const loginStateLoading = loginAtomValue.loading;
  const loginStateError = loginAtomValue.error;
  const getLoginState = useSetAtom(getLoginStateAtom);

  useEffect(() => {
    if (!loginState && !loginStateLoading && !loginStateError) {
      getLoginState(false);
      return;
    }

    // Redirect to previous requested path or the default page for that user group (LOGGED_IN_HOME or WORKSPACE_ASSIGNMENTS)
    if (
      loginState &&
      loginState.message === LoginMessage.LOGGED_IN &&
      !loginStateLoading
    ) {
      let path: string | undefined = (location?.state as any)?.from?.pathname;

      if (!path) {
        if (isPupil(loginState?.commonUserInfo?.userGroup?.id)) {
          path = APP_PATH.WORKSPACE_ASSIGNMENTS.route;
        } else {
          path = APP_PATH.LOGGED_IN_HOME.route;
        }
      }

      navigateFunc(path);

      return;
    }

    if (
      loginState &&
      loginState.message === LoginMessage.LOGGED_OUT &&
      !loginStateLoading &&
      !loginStateError
    ) {
      redirectToServerLoginPage(location);
    }
  }, [
    getLoginState,
    loginState,
    loginStateLoading,
    loginStateError,
    navigateFunc,
    location,
  ]);

  const tryLoginAgainManually = () => {
    if (localStorage) {
      localStorage.removeItem(LOGIN_ATTEMPT_KEY);
    }
    getLoginState(false);
  };

  if (loginStateError) {
    return (
      <ErrorView
        locationId="login--error"
        message={tText('authentication/views/login___het-inloggen-is-mislukt')}
        icon={IconName.lock}
      >
        <Button
          type="link"
          onClick={tryLoginAgainManually}
          label={tText('authentication/views/login___probeer-opnieuw')}
        />
      </ErrorView>
    );
  }

  if (!loginState || loginStateLoading) {
    // Wait for login check
    return <FullPageSpinner locationId="login--loading" />;
  }

  return null;
};

export default Login;
