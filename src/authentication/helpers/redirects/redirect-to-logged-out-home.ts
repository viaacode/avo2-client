import { type Location } from 'react-router'

import { getBaseUrl } from '../get-base-url';

export function redirectToLoggedOutHome(location: Location): void {
  window.location.href = getBaseUrl(location)
}
