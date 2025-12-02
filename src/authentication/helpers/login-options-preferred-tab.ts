import { NOT_NOW_LOCAL_STORAGE_KEY } from '../../shared/constants';

const LOGIN_OPTIONS_PREFERRED_TAB_LOCAL_STORAGE_KEY =
  'AVO.login_options_preferred_tab';

export const LoginOptionsTabs = {
  TEACHER: 'lesgever',
  STUDENT: 'leerling',
};

export function getPreferredLoginOption() {
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
