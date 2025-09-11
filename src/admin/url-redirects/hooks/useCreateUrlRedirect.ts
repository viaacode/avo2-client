import { useMutation } from '@tanstack/react-query';

import { UrlRedirectsService } from '../url-redirects.service';
import { type UrlRedirect } from '../url-redirects.types';

export const useCreateUrlRedirect = () => {
	return useMutation(
		(urlRedirect: UrlRedirect): Promise<UrlRedirect> =>
			UrlRedirectsService.insertUrlRedirect(urlRedirect)
	);
};
