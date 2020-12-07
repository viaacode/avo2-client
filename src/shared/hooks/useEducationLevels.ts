import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { SettingsService } from '../../settings/settings.service';
import { CustomError } from '../helpers';
import { ToastService } from '../services';

type UseEducationLevelsTuple = [string[], boolean];

export const useEducationLevels = (): UseEducationLevelsTuple => {
	const [t] = useTranslation();

	const [educationLevels, setEducationLevels] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		SettingsService.fetchEducationLevels()
			.then((educationLevels: string[]) => {
				setEducationLevels(educationLevels);
			})
			.catch((err) => {
				console.error(
					new CustomError('Failed to get educationLevels from the database', err)
				);
				ToastService.danger(
					t(
						'shared/hooks/use-education-levels___ophalen-van-de-opleidingsniveaus-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [t]);

	return [educationLevels, isLoading];
};
