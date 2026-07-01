import { NOT_NOW_LOCAL_STORAGE_KEY } from '../../shared/constants';
import { ROUTE_PARTS } from '../../shared/constants/routes.ts';

const LOGIN_OPTIONS_PREFERRED_TAB_LOCAL_STORAGE_KEY =
  'AVO.login_options_preferred_tab';

export const LoginOptionsTabs = {
  TEACHER: 'lesgever',
  PUPIL: 'leerling',
};

export function getPreferredLoginOption() {
  const urlParams = new URLSearchParams(window.location.search);
  const returnToUrl = urlParams.get('returnToUrl') || ''; // When redirected to /registreer-of-login

  const includesAssignments = `/${ROUTE_PARTS.assignments}/`;
  const includesQuicklane = `/${ROUTE_PARTS.quickLane}/`;

  if (
    window.location.href.includes(includesAssignments) ||
    window.location.href.includes(includesQuicklane) ||
    returnToUrl.includes(includesAssignments) ||
    returnToUrl.includes(includesQuicklane)
  ) {
    return (
      localStorage?.getItem(LOGIN_OPTIONS_PREFERRED_TAB_LOCAL_STORAGE_KEY) ||
      LoginOptionsTabs.PUPIL
    );
  }
  return (
    localStorage?.getItem(LOGIN_OPTIONS_PREFERRED_TAB_LOCAL_STORAGE_KEY) ||
    LoginOptionsTabs.TEACHER
  );
}

export function setPreferredLoginOption(id: string | number) {
  localStorage.setItem(
    LOGIN_OPTIONS_PREFERRED_TAB_LOCAL_STORAGE_KEY,
    id.toString(),
  );
}

export function removePreferredLoginOption() {
  localStorage.removeItem(NOT_NOW_LOCAL_STORAGE_KEY);
}
