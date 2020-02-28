import { useEffect, useState } from 'react';

import { Avo } from '@viaa/avo2-types';

import { fetchContentBlocksByContentId } from '../services/content-block.service';

type UseContentBlocksByContentIdTuple = [Avo.ContentBlocks.ContentBlocks[], boolean];

export const useContentBlocksByContentId = (id?: string): UseContentBlocksByContentIdTuple => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [contentBlocks, setContentBlocks] = useState<Avo.ContentBlocks.ContentBlocks[]>([]);

	useEffect(() => {
		if (id) {
			setIsLoading(true);

			fetchContentBlocksByContentId(Number(id))
				.then(contentBlockResponse => {
					if (contentBlockResponse && contentBlockResponse.length) {
						setContentBlocks(contentBlockResponse);
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [id]);

	return [contentBlocks, isLoading];
};
