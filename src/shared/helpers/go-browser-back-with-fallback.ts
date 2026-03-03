import { type NavigateFunction } from 'react-router';
import { getEnv } from './env.ts';
import { navigate } from './link';

/**
 * Go back in browser history, or navigate to a fallback path if the previous page is not from the same domain
 * @param fallbackPath
 * @param navigateFunc NavigateFunction from react-router
 */
export function goBrowserBackWithFallback(
  fallbackPath: string,
  navigateFunc: NavigateFunction,
) {
  if (document.referrer.includes(getEnv('CLIENT_URL') as string)) {
    navigateFunc(-1);
  } else {
    navigate(navigateFunc, fallbackPath);
  }
}
