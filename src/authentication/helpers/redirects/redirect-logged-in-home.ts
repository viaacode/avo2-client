import type { RouteComponentProps } from 'react-router-dom';

import { getBaseUrl } from '../get-base-url';

export function redirectToLoggedInHome(location: RouteComponentProps['location']): void {
	window.location.href = `${getBaseUrl(location)}/start`;
}
