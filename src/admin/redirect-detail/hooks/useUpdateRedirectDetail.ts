import { useMutation } from '@tanstack/react-query';

import { RedirectDetailService } from '../redirect-detail.service';
import { type RedirectDetail } from '../redirect-detail.types';

export const useUpdateRedirectDetail = () => {
	return useMutation(
		(redirectDetail: RedirectDetail): Promise<number> =>
			RedirectDetailService.updateRedirectDetail(redirectDetail)
	);
};
