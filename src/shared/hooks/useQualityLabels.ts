import { useEffect, useState } from 'react';

import { QualityLabel } from '../../collection/collection.types';
import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers';
import { QualityLabelsService } from '../services/quality-labels.service';
import { ToastService } from '../services/toast-service';

type UseQualityLabelsTuple = [QualityLabel[], boolean];

export const useQualityLabels = (enabled: boolean): UseQualityLabelsTuple => {
	const { tText, tHtml } = useTranslation();

	const [collectionQualityLabels, setCollectionQualityLabels] = useState<QualityLabel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!enabled) {
			return;
		}
		setIsLoading(true);

		QualityLabelsService.fetchQualityLabels()
			.then((collectionQualityLabels: QualityLabel[]) => {
				setCollectionQualityLabels(collectionQualityLabels);
			})
			.catch((err) => {
				console.error(
					new CustomError('Failed to get qualityLabels from the database', err)
				);
				ToastService.danger(tHtml('Het ophalen van de kwaliteitslabels is mislukt'));
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tText]);

	return [collectionQualityLabels, isLoading];
};
