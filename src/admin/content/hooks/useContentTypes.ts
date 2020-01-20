import { useEffect, useState } from 'react';

import { fetchContentTypes } from '../content.service';
import { ContentTypesResponse } from '../content.types';

type UseContentTypesTuple = [ContentTypesResponse[], boolean];

export const useContentTypes = (): UseContentTypesTuple => {
	const [contentTypes, setContentTypes] = useState<ContentTypesResponse[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		fetchContentTypes()
			.then((data: ContentTypesResponse[] | null) => {
				if (data) {
					setContentTypes(data);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return [contentTypes, isLoading];
};
