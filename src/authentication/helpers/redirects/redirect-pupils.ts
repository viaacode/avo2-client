import type { RouteComponentProps } from 'react-router-dom';

import { ROUTE_PARTS } from '../../../shared/constants';
import { getBaseUrl } from '../get-base-url';

export function redirectToPupils(location: RouteComponentProps['location']): void {
	window.location.href = `${getBaseUrl(location)}/${ROUTE_PARTS.pupils}`;
}
