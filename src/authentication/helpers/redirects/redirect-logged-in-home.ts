import type { Location } from 'react-router'

import { getBaseUrl } from '../get-base-url.js'

export function redirectToLoggedInHome(location: Location): void {
  window.location.href = `${getBaseUrl(location)}/start`
}
