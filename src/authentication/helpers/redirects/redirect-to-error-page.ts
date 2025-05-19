import queryString from 'query-string';
import type { RouteComponentProps } from 'react-router-dom';

import type { ErrorViewQueryParams } from '../../../error/views/ErrorView';
import { getBaseUrl } from '../get-base-url';

export function redirectToErrorPage(
	props: ErrorViewQueryParams,
	location: RouteComponentProps['location']
): void {
	const baseUrl = getBaseUrl(location);
	window.location.href = `${baseUrl}/error?${queryString.stringify(props)}`;
}
