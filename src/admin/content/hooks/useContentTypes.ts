import { useEffect, useState } from 'react';

import { fecthContentTypes } from '../content.services';
import { ContentTypesResponse } from '../content.types';

export const useContentTypes = () => {
	const [contentTypes, setContentTypes] = useState<ContentTypesResponse[]>([]);
	const [isLoadingContentTypes, setIsLoadingContentTypes] = useState<boolean>(false);

	useEffect(() => {
		setIsLoadingContentTypes(true);

		fecthContentTypes()
			.then((data: ContentTypesResponse[] | null) => {
				if (data) {
					setContentTypes(data);
				}
			})
			.finally(() => {
				setIsLoadingContentTypes(false);
			});
	}, []);

	return { contentTypes, isLoadingContentTypes };
};
