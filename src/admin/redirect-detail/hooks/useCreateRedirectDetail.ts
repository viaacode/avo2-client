import { useMutation } from '@tanstack/react-query';

import { RedirectDetailService } from '../redirect-detail.service';
import { type RedirectDetail } from '../redirect-detail.types';

export const useCreateRedirectDetail = () => {
	return useMutation(
		(redirectDetail: RedirectDetail): Promise<RedirectDetail> =>
			RedirectDetailService.insertRedirectDetail(redirectDetail)
	);
};
