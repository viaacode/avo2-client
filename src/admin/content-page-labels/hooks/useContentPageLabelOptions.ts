import { capitalize, orderBy, startCase } from 'lodash-es';
import { useEffect, useState } from 'react';

import { CheckboxOption } from '../../../shared/components';
import { CustomError } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { ContentPageLabelService } from '../content-page-label.service';
import { ContentPageLabel } from '../content-page-label.types';

type UseContentPageLabelsTuple = [CheckboxOption[], boolean];

export const useContentPageLabelOptions = (): UseContentPageLabelsTuple => {
	const { tText, tHtml } = useTranslation();
	const [contentPageLabelOptions, setContentPageLabelOptions] = useState<CheckboxOption[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		ContentPageLabelService.fetchContentPageLabels(0, 'label', 'asc', {}, 10000)
			.then((reply: [ContentPageLabel[], number]) => {
				setContentPageLabelOptions(
					orderBy(
						reply[0].map(
							(opt): CheckboxOption => ({
								label: `${capitalize(startCase(opt.content_type))}: ${opt.label}`,
								id: String(opt.id),
								checked: false,
							})
						),
						['label']
					)
				);
			})
			.catch((err: any) => {
				console.error(new CustomError('Failed to get user group options', err));
				ToastService.danger(
					tHtml(
						'admin/user-groups/hooks/use-user-group-options___het-ophalen-van-de-gebruikergroep-opties-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [setIsLoading, setContentPageLabelOptions, tText]);

	return [contentPageLabelOptions, isLoading];
};
