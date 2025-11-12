import queryString from 'query-string'
import { type Location } from 'react-router-dom'

import type { ErrorViewQueryParams } from '../../../error/views/ErrorView.js'
import { getBaseUrl } from '../get-base-url.js'

export function redirectToErrorPage(
  props: ErrorViewQueryParams,
  location: Location,
): void {
  const baseUrl = getBaseUrl(location)
  window.location.href = `${baseUrl}/error?${queryString.stringify(props)}`
}
