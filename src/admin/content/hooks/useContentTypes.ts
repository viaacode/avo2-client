import { SelectOption } from '@viaa/avo2-components';
import { useEffect, useState } from 'react';

import { ContentService } from '../content.service';
import { ContentPageType } from '../content.types';

type UseContentTypesTuple = [SelectOption<ContentPageType>[], boolean];

export const useContentTypes = (): UseContentTypesTuple => {
	const [contentTypeOptions, setContentTypeOptions] = useState<SelectOption<ContentPageType>[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		ContentService.getContentTypes()
			.then((types) => {
				if (types) {
					setContentTypeOptions(types);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return [contentTypeOptions, isLoading];
};
