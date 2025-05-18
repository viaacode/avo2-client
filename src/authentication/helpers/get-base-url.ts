import { trimEnd } from 'lodash-es';
import type { RouteComponentProps } from 'react-router-dom';

export function getBaseUrl(location: RouteComponentProps['location']): string {
	if (location.pathname === '/') {
		return trimEnd(window.location.href, '/');
	}
	return trimEnd(decodeURIComponent(window.location.href).split(location.pathname)[0], '/');
}
