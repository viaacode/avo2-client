import { Avo } from '@viaa/avo2-types';
import { useEffect, useState } from 'react';

import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers';
import { LomService } from '../services/lom.service';
import { ToastService } from '../services/toast-service';

type UseLomEducationLevelsTuple = [Avo.Lom.LomField[], boolean];

export const useLomEducationLevels = (): UseLomEducationLevelsTuple => {
	const { tText, tHtml } = useTranslation();

	const [educationLevels, setEducationLevels] = useState<Avo.Lom.LomField[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		LomService.fetchEducationLevels()
			.then((educationLevels: Avo.Lom.LomField[]) => {
				setEducationLevels(educationLevels);
			})
			.catch((err) => {
				console.error(
					new CustomError('Failed to get educationLevels from the database', err)
				);
				ToastService.danger(
					tHtml(
						'shared/hooks/use-education-levels___ophalen-van-de-opleidingsniveaus-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tText]);

	return [educationLevels, isLoading];
};
