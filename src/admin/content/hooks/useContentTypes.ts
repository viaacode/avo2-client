import { compact } from 'lodash-es';
import { useEffect, useState } from 'react';

import { SelectOption } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentService } from '../content.service';

type UseContentTypesTuple = [SelectOption<Avo.ContentPage.Type>[], boolean];

export const useContentTypes = (): UseContentTypesTuple => {
	const [contentTypeOptions, setContentTypeOptions] = useState<
		SelectOption<Avo.ContentPage.Type>[]
	>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		ContentService.getContentTypes()
			.then((types: Avo.ContentPage.Type[] | null) => {
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
