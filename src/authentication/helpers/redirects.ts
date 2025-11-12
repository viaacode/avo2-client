import { type Avo } from '@viaa/avo2-types';
import { isString, omit, trimStart } from 'es-toolkit';
import queryString, { stringifyUrl } from 'query-string';
import { type Location } from 'react-router';

import { APP_PATH } from '../../constants.js';
import { EmbedCodeService } from '../../embed-code/embed-code-service.js';
import { ROUTE_PARTS } from '../../shared/constants/index.js';
import { getEnv } from '../../shared/helpers/env.js';
import { SERVER_LOGOUT_PAGE } from '../authentication.const.js';
import { STAMBOEK_LOCAL_STORAGE_KEY } from '../views/registration-flow/r3-stamboek.js';

import { getBaseUrl } from './get-base-url.js';

/**
 *
 * Server redirect functions
 *
 **/

function getRedirectUrl(
  location: Location,
  closeTabAfterLogin: boolean,
): string {
  return closeTabAfterLogin
    ? getBaseUrl(location) + '/embed/close-browser'
    : getRedirectAfterLogin(location);
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
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/acmidm/login?${queryString.stringify(
    {
      returnToUrl,
      authMech: 'leerid',
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
  if (openInNewTab) {
    window.open(fullUrl, '_blank');
  } else {
    window.location.href = fullUrl;
  }
}

export function redirectToServerACMIDMLogin(
  location: Location,
  openInNewTab = false,
): void {
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/acmidm/login?${queryString.stringify(
    {
      returnToUrl,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
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
  // Redirect to smartschool login form
  // Url to return to after authentication is completed and server stored auth object in session
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/smartschool/login?${queryString.stringify(
    {
      returnToUrl,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
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
  // Redirect to klascement login form
  // Url to return to after authentication is completed and server stored auth object in session
  const returnToUrl = getRedirectUrl(location, openInNewTab);
  const fullUrl = `${getEnv('PROXY_URL')}/auth/klascement/login?${queryString.stringify(
    {
      returnToUrl,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
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
  const returnToUrl = getBaseUrl(location) + APP_PATH.LOGIN.route;
  const fullUrl = `${getEnv('PROXY_URL')}/auth/hetarchief/register?${queryString.stringify(
    {
      returnToUrl,
      stamboekNumber,
      ltiJwtToken: EmbedCodeService.getJwtToken(),
    },
  )}`;
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
  // Url to return to after logout is completed
  const returnToUrl = `${getBaseUrl(location)}${routeAfterLogout}`;
  window.location.href = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify(
    {
      returnToUrl,
    },
  )}`;
}

export function logoutAndRedirectToLogin(location?: Location): void {
  // Url to return to after logout is completed
  let returnToUrl = window.location.origin + APP_PATH.REGISTER_OR_LOGIN.route;

  if (location) {
    returnToUrl = `${returnToUrl}?${queryString.stringify({
      // Url to redirect to after logging back in
      returnToUrl: getRedirectAfterLogin(location),
    })}`;
  }

  window.location.href = `${getEnv('PROXY_URL')}/${SERVER_LOGOUT_PAGE}?${queryString.stringify(
    {
      returnToUrl,
    },
  )}`;
}

/**
 * Redirect to server link accounts route
 * @param location
 * @param idpType
 * @param idpParameters optional query parameters that are sent to the IDP login url
 */
export function redirectToServerLinkAccount(
  location: Location,
  idpType: Avo.Auth.IdpType,
  idpParameters?: string,
): void {
  const returnToUrl = getBaseUrl(location) + location.pathname;
  window.location.href = `${getEnv('PROXY_URL')}/auth/link-account?${queryString.stringify(
    {
      returnToUrl,
      idpType,
      idpParameters,
    },
  )}`;
}

export function redirectToServerUnlinkAccount(
  location: Location,
  idpType: Avo.Auth.IdpType,
): void {
  const returnToUrl = getBaseUrl(location) + location.pathname;
  window.location.href = `${getEnv('PROXY_URL')}/auth/unlink-account?${queryString.stringify(
    {
      returnToUrl,
      idpType,
    },
  )}`;
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
