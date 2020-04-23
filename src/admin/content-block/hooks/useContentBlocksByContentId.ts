import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ContentBlockService } from '../services/content-block.service';

type UseContentBlocksByContentIdTuple = [Avo.ContentBlocks.ContentBlocks[], boolean];

export const useContentBlocksByContentId = (id?: string): UseContentBlocksByContentIdTuple => {
	const [t] = useTranslation();

	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [contentBlocks, setContentBlocks] = useState<Avo.ContentBlocks.ContentBlocks[]>([]);

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
					ToastService.danger(t('Het ophalen van de content blokken is mislukt'));
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [id]);

	return [contentBlocks, isLoading];
};
