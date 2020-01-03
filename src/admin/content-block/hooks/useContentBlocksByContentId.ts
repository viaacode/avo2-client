import { Dispatch, useEffect, useState } from 'react';

import { fetchContentBlocksByContentId } from '../content-block.services';
import { ContentBlockSchema } from '../content-block.types';

type UseContentBlocksByContentIdTuple = [boolean];

export const useContentBlocksByContentId = (
	setCbConfigs: Dispatch<ContentBlockSchema[]>,
	id?: string
): UseContentBlocksByContentIdTuple => {
	const [isLoading, setIsLoading] = useState();

	useEffect(() => {
		if (id) {
			setIsLoading(true);

			fetchContentBlocksByContentId(Number(id))
				.then(cbConfigs => {
					if (cbConfigs && cbConfigs.length) {
						setCbConfigs(cbConfigs);
					}
				})
				.finally(() => {
					setIsLoading(false);
				});
		}
	}, [id, setCbConfigs]);

	return [isLoading];
};
