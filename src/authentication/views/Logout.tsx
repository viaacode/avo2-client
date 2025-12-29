import { useAtomValue } from 'jotai';
import { type FC, useEffect } from 'react';
import { useLocation } from 'react-router-dom';

import { APP_PATH } from '../../constants';
import { ROUTE_PARTS } from '../../shared/constants/routes';
import { isPupil } from '../../shared/helpers/is-pupil';
import { commonUserAtom } from '../authentication.store';
import { redirectToServerLogoutPage } from '../helpers/redirects/redirects';

export const Logout: FC = () => {
  const location = useLocation();

  const commonUser = useAtomValue(commonUserAtom);

  useEffect(() => {
    redirectToServerLogoutPage(
      location,
      isPupil(commonUser?.userGroup?.id)
        ? '/' + ROUTE_PARTS.pupils
        : APP_PATH.HOME.route,
    );
  }, []);

  return null;
};

export default Logout;
