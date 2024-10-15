import { type RouteComponentProps } from 'react-router';

import { navigate } from './link';

/**
 * Go back in browser history, or navigate to a fallback path if the previous page is not from the same domain
 * @param fallbackPath
 * @param history
 */
export function goBrowserBackWithFallback(
	fallbackPath: string,
	history: RouteComponentProps['history']
) {
	if (document.referrer.includes(window.location.origin)) {
		history.goBack();
	} else {
		navigate(history, fallbackPath);
	}
}
