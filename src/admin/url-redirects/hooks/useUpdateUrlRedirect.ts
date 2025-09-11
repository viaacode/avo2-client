import { useMutation } from '@tanstack/react-query';

import { UrlRedirectsService } from '../url-redirects.service';
import { type UrlRedirect } from '../url-redirects.types';

export const useUpdateUrlRedirect = () => {
	return useMutation(
		(urlRedirect: UrlRedirect): Promise<UrlRedirect> =>
			UrlRedirectsService.updateUrlRedirect(urlRedirect)
	);
};
