import { useMutation } from '@tanstack/react-query';

import { UrlRedirectsService } from '../url-redirects.service.js';

export const useDeleteUrlRedirect = () => {
	return useMutation(
		(urlRedirectId: number): Promise<void> =>
			UrlRedirectsService.deleteUrlRedirect(urlRedirectId)
	);
};
