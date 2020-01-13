import { useEffect, useState } from 'react';

import { fetchContentBlocksByContentId } from '../content-block.services';
import { ContentBlockSchema } from '../content-block.types';

type UseContentBlocksByContentIdTuple = [ContentBlockSchema[], boolean];

export const useContentBlocksByContentId = (id?: string): UseContentBlocksByContentIdTuple => {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [contentBlocks, setContentBlocks] = useState<ContentBlockSchema[]>([]);

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
