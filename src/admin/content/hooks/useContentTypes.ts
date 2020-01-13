import { useEffect, useState } from 'react';

import { fecthContentTypes } from '../content.services';
import { ContentTypesResponse } from '../content.types';

type UseContentTypesTuple = [ContentTypesResponse[], boolean];

export const useContentTypes = (): UseContentTypesTuple => {
	const [contentTypes, setContentTypes] = useState<ContentTypesResponse[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		fecthContentTypes()
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
