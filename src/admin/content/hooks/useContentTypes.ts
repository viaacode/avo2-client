import { useEffect, useState } from 'react';

import { fecthContentTypes } from '../../../shared/services/content-service';

import { ContentTypesResponse } from '../content.types';

export const useContentTypes = () => {
	const [contentTypes, setContentTypes] = useState<ContentTypesResponse[]>([]);
	const [isLoadingContentTypes, setIsLoadingContentTypes] = useState<boolean>(false);

	useEffect(() => {
		setIsLoadingContentTypes(true);

		fecthContentTypes()
			.then((data: ContentTypesResponse[]) => {
				setContentTypes(data);
			})
			.finally(() => {
				setIsLoadingContentTypes(false);
			});
	});

	return { contentTypes, isLoadingContentTypes };
};
