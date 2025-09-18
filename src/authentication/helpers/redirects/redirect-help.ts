import type { Location } from 'react-router';

import { ROUTE_PARTS } from '../../../shared/constants';
import { getBaseUrl } from '../get-base-url';

export function redirectToHelp(location: Location): void {
	window.location.href = `${getBaseUrl(location)}/${ROUTE_PARTS.help}`;
}
