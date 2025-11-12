import type { Location } from 'react-router'

import { ROUTE_PARTS } from '../../../shared/constants/index.js'
import { getBaseUrl } from '../get-base-url.js'

export function redirectToHelp(location: Location): void {
  window.location.href = `${getBaseUrl(location)}/${ROUTE_PARTS.help}`
}
