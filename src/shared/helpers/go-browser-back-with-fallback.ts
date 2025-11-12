import { type NavigateFunction } from 'react-router'

import { navigate } from './link.js'

/**
 * Go back in browser history, or navigate to a fallback path if the previous page is not from the same domain
 * @param fallbackPath
 * @param navigateFunc NavigateFunction from react-router
 */
export function goBrowserBackWithFallback(
  fallbackPath: string,
  navigateFunc: NavigateFunction,
) {
  if (document.referrer.includes(window.location.origin)) {
    navigateFunc(-1)
  } else {
    navigate(navigateFunc, fallbackPath)
  }
}
