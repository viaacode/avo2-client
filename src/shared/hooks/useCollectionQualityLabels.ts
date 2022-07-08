import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { CollectionService } from '../../collection/collection.service';
import { QualityLabel } from '../../collection/collection.types';
import { CustomError } from '../helpers';
import { ToastService } from '../services';

type UseCollectionQualityLabelsTuple = [QualityLabel[], boolean];

export const useCollectionQualityLabels = (enabled: boolean): UseCollectionQualityLabelsTuple => {
	const [t] = useTranslation();

	const [collectionQualityLabels, setCollectionQualityLabels] = useState<QualityLabel[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		if (!enabled) {
			return;
		}
		setIsLoading(true);

		CollectionService.fetchQualityLabels()
			.then((collectionQualityLabels: QualityLabel[]) => {
				setCollectionQualityLabels(collectionQualityLabels);
			})
			.catch((err) => {
				console.error(
					new CustomError('Failed to get collectionQualityLabels from the database', err)
				);
				ToastService.danger(
					t(
						'shared/hooks/use-collection-quality-labels___het-ophalen-van-de-collectie-kwaliteitslabels-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [t]);

	return [collectionQualityLabels, isLoading];
};
