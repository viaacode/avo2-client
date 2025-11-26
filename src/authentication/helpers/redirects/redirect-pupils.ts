import { type Location } from 'react-router';

import { ROUTE_PARTS } from '../../../shared/constants/routes';
import { getBaseUrl } from '../get-base-url';

export function redirectToPupils(location: Location): void {
  window.location.href = `${getBaseUrl(location)}/${ROUTE_PARTS.pupils}`;
}
