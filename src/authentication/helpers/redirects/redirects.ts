import { AvoAuthIdpType } from '@viaa/avo2-types';

import { isString, omit, trimStart } from 'es-toolkit';
import queryString, { stringifyUrl } from 'query-string';
import { type Location, NavigateFunction } from 'react-router';

import { APP_PATH } from '../../../constants';
import { EmbedCodeService } from '../../../embed-code/embed-code-service';
import { ROUTE_PARTS } from '../../../shared/constants/routes';
import { getEnv } from '../../../shared/helpers/env';
import { isServerSideRendering } from '../../../shared/helpers/routing/is-server-side-rendering.ts';
import { SERVER_LOGOUT_PAGE } from '../../authentication.const';
import { STAMBOEK_LOCAL_STORAGE_KEY } from '../../views/registration-flow/register-stamboek.tsx';
import { getBaseUrl } from '../get-base-url';

function logIfRedirectLoggingEnabled(newUrl: string): void {
  if (getEnv('ENABLE_LOG_CLIENT_REDIRECTS')) {
    console.info('REDIRECT: ' + window.location.href + ' => ' + newUrl);
  }
}

export function redirectToClientPage(
  path: string,
  navigate: NavigateFunction,
): void {
  logIfRedirectLoggingEnabled(path);
  navigate(path);
}

/**
 *
 * Server redirect functions
 *
 **/

function getRedirectUrl(
  location: Location,
  closeTabAfterLogin: boolean,
): string {
  const newUrl = closeTabAfterLogin
    ? getBaseUrl(location) + '/embed/close-browser'
    : getRedirectAfterLogin(location);
  logIfRedirectLoggingEnabled(newUrl);
  return newUrl;
}

/**
 * Redirect to the server login page for the hetarchief idp (acm / ldap meemoo)
 * @param location
 * @param openInNewTab used for embed iframes that need to login using the separate browser tab and close the ta automatically
 */
export function redirectToServerLoginPage(
  location: Location,
  openInNewTab = false,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  // Redirect to login form
  // Url to return to after authentication is completed and server stored auth object in session
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  // Not logged in, we need to redirect the user to the SAML identity server login page
  const fullUrl = stringifyUrl({
    url: `${getEnv('PROXY_URL')}/auth/hetarchief/login`,
    query: {
      returnToUrl,
      stamboekNumber:
        localStorage && localStorage.getItem(STAMBOEK_LOCAL_STORAGE_KEY),
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  });
  logIfRedirectLoggingEnabled(fullUrl);
  if (openInNewTab) {
    window.open(fullUrl, '_blank');
  } else {
    window.location.href = fullUrl;
  }
}

export function redirectToServerLeerIDLogin(
  location: Location,
  openInNewTab = false,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/acmidm/login?${queryString.stringify(
    {
      returnToUrl,
      authMech: 'leerid',
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
  logIfRedirectLoggingEnabled(fullUrl);
  if (openInNewTab) {
    window.open(fullUrl, '_blank');
  } else {
    window.location.href = fullUrl;
  }
}

export function redirectToServerFlemishGovernmentLogin(
  location: Location,
  openInNewTab = false,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/acmidm/login?${queryString.stringify(
    {
      returnToUrl,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
  logIfRedirectLoggingEnabled(fullUrl);
  if (openInNewTab) {
    window.open(fullUrl, '_blank');
  } else {
    window.location.href = fullUrl;
  }
}

export function redirectToServerSmartschoolLogin(
  location: Location,
  openInNewTab = false,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  // Redirect to smartschool login form
  // Url to return to after authentication is completed and server stored auth object in session
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify(
    {
      returnToUrl,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
  logIfRedirectLoggingEnabled(fullUrl);
  if (openInNewTab) {
    window.open(fullUrl, '_blank');
  } else {
    window.location.href = fullUrl;
  }
}

export function redirectToServerKlascementLogin(
  location: Location,
  openInNewTab = false,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  // Redirect to klascement login form
  // Url to return to after authentication is completed and server stored auth object in session
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/klascement/login?${queryString.stringify(
    {
      returnToUrl,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
  logIfRedirectLoggingEnabled(fullUrl);
  if (openInNewTab) {
    window.open(fullUrl, '_blank');
  } else {
    window.location.href = fullUrl;
  }
}

export function redirectToServerArchiefRegistrationIdp(
  location: Location,
  stamboekNumber: string,
  openInNewTab = false,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  const returnToUrl = getBaseUrl(location) + APP_PATH.LOGIN.route;
  const fullUrl = `${getEnv('PROXY_URL')}/auth/hetarchief/register?${queryString.stringify(
    {
      returnToUrl,
      stamboekNumber,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
  logIfRedirectLoggingEnabled(fullUrl);
  if (openInNewTab) {
    window.open(fullUrl, '_blank');
  } else {
    window.location.href = fullUrl;
  }
}

export function redirectToServerLogoutPage(
  location: Location,
  routeAfterLogout: string,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  // Url to return to after logout is completed
  const returnToUrl = `${getBaseUrl(location)}${routeAfterLogout}`;
  const newUrl = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify(
    {
      returnToUrl,
    },
  )}`;
  logIfRedirectLoggingEnabled(newUrl);
  window.location.href = newUrl;
}

export function getLogoutAndRedirectToLoginUrl(
  location: Location | null,
): string {
  // Url to return to after logout is completed
  let returnToUrl = getEnv('CLIENT_URL') + APP_PATH.REGISTER_OR_LOGIN.route;

  if (location) {
    returnToUrl = stringifyUrl({
      url: returnToUrl,
      query: {
        // Url to redirect to after logging back in
        returnToUrl: getRedirectAfterLogin(location),
      },
    });
  }

  return stringifyUrl({
    url: `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}`,
    query: {
      returnToUrl,
    },
  });
}

export function logoutAndRedirectToLogin(location: Location | null): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  const newUrl = getLogoutAndRedirectToLoginUrl(location);
  logIfRedirectLoggingEnabled(newUrl);
  window.location.href = newUrl;
}

/**
 * Redirect to server link accounts route
 * @param location
 * @param idpType
 * @param idpParameters optional query parameters that are sent to the IDP login url
 */
export function redirectToServerLinkAccount(
  location: Location,
  idpType: AvoAuthIdpType,
  idpParameters?: string,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  const returnToUrl = getBaseUrl(location) + location.pathname;
  const newUrl = `${getEnv('PROXY_URL')}/auth/link-account?${queryString.stringify(
    {
      returnToUrl,
      idpType,
      idpParameters,
    },
  )}`;
  logIfRedirectLoggingEnabled(newUrl);
  window.location.href = newUrl;
}

export function redirectToServerUnlinkAccount(
  location: Location,
  idpType: AvoAuthIdpType,
): void {
  if (isServerSideRendering()) {
    // Window object not available on server side
    return;
  }
  const returnToUrl = getBaseUrl(location) + location.pathname;
  const newUrl = `${getEnv('PROXY_URL')}/auth/unlink-account?${queryString.stringify(
    {
      returnToUrl,
      idpType,
    },
  )}`;
  logIfRedirectLoggingEnabled(newUrl);
  window.location.href = newUrl;
}

/**
 *
 * Other redirect functions
 *
 **/

function getFromPath(
  location: Location,
  defaultPath: string = APP_PATH.LOGGED_IN_HOME.route,
): string {
  let fromPath =
    location?.state?.from?.pathname || location?.pathname || defaultPath;
  if (fromPath === `/${ROUTE_PARTS.registerOrLogin}`) {
    fromPath = '/';
  }
  const fromSearch = location?.state?.from?.search || location?.search || '';
  return `/${trimStart(fromPath + fromSearch, '/')}`;
}

function getRedirectAfterLogin(
  location: Location,
  defaultPath: string = APP_PATH.LOGGED_IN_HOME.route,
): string {
  // From query string
  const queryStrings = queryString.parse(location.search);

  if (queryStrings.returnToUrl && isString(queryStrings.returnToUrl)) {
    const returnToUrl = queryStrings.returnToUrl;
    if (!returnToUrl.startsWith('http') && !returnToUrl.startsWith('//')) {
      // make url absolute
      return getBaseUrl(location) + returnToUrl;
    }
    return returnToUrl;
  }

  // From location history
  if (location.pathname === `/${ROUTE_PARTS.registerOrLogin}`) {
    return getBaseUrl(location) + getFromPath(location);
  }

  const base = getBaseUrl(location);
  const from = getFromPath(location, defaultPath);
  if (from === '/' || from.startsWith('/error')) {
    return `${base}${defaultPath}`;
  }
  return queryString.stringifyUrl({
    url: `${base}${from}`,
    query: omit(queryStrings, ['returnToUrl']),
  });
}
