import { compact } from 'lodash-es';
import { useEffect, useState } from 'react';

import { SelectOption } from '@viaa/avo2-components';
import { fetchContentTypes } from '../content.service';
import { ContentPageType } from '../content.types';

type UseContentTypesTuple = [SelectOption<ContentPageType>[], boolean];

export const useContentTypes = (): UseContentTypesTuple => {
	const [contentTypeOptions, setContentTypeOptions] = useState<SelectOption<ContentPageType>[]>(
		[]
	);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		fetchContentTypes()
			.then((types: ContentPageType[] | null) => {
				if (types) {
					setContentTypeOptions(
						compact(
							types.map(type => {
								if (
									(type as string) === 'FAQ_OVERZICHT' || // TODO remove once all content pages have been updated in qas and prod database
									(type as string) === 'NIEUWS_OVERZICHT'
								) {
									return null;
								}
								return {
									label: type,
									value: type,
								};
							})
						)
					);
				}
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, []);

	return [contentTypeOptions, isLoading];
};
