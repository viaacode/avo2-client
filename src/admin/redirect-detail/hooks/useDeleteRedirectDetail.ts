import { useMutation } from '@tanstack/react-query';

import { RedirectDetailService } from '../redirect-detail.service';

export const useDeleteRedirectDetail = () => {
	return useMutation(
		(redirectDetailId: number): Promise<void> =>
			RedirectDetailService.deleteRedirectDetail(redirectDetailId)
	);
};
