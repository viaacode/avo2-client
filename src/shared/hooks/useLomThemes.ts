import { type Avo } from '@viaa/avo2-types';
import { useEffect, useState } from 'react';

import { useTranslation } from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers/custom-error';
import { LomService } from '../services/lom.service';
import { ToastService } from '../services/toast-service';

type UseLomThemesTuple = [Avo.Lom.LomField[], boolean];

export const useLomThemes = (): UseLomThemesTuple => {
	const { tText, tHtml } = useTranslation();

	const [themes, setThemes] = useState<Avo.Lom.LomField[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		LomService.fetchThemes()
			.then((educationLevels: Avo.Lom.LomField[]) => {
				setThemes(educationLevels);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get lom themes from the database', err));
				ToastService.danger(
					tHtml('shared/hooks/use-lom-themes___het-ophalen-van-de-themas-is-mislukt')
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tText, tHtml]);

	return [themes, isLoading];
};
