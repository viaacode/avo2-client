import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CustomError } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ContentBlockConfig } from '../../shared/types';
import { ContentBlockService } from '../services/content-block.service';

type UseContentBlocksByContentIdTuple = [ContentBlockConfig[], boolean];

export const useContentBlocksByContentId = (id?: string): UseContentBlocksByContentIdTuple => {
	const [t] = useTranslation();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [contentBlocks, setContentBlocks] = useState<ContentBlockConfig[]>([]);

	useEffect(() => {
		if (id) {
			setIsLoading(true);

			ContentBlockService.fetchContentBlocksByContentId(Number(id))
				.then(contentBlockResponse => {
					if (contentBlockResponse && contentBlockResponse.length) {
						setContentBlocks(contentBlockResponse);
					}
				})
				.catch(err => {
					console.error(
						new CustomError('Failed to load content blocks from content page', err, {
							id,
						})
					);
					ToastService.danger(
						t(
							'admin/content-block/hooks/use-content-blocks-by-content-id___het-ophalen-van-de-content-blokken-is-mislukt'
						)
					);
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [id, t]);

	return [contentBlocks, isLoading];
};
