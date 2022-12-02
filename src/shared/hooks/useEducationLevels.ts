import { useEffect, useState } from 'react';

import { SettingsService } from '../../settings/settings.service';
import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers';
import { ToastService } from '../services/toast-service';

type UseEducationLevelsTuple = [string[], boolean];

export const useEducationLevels = (): UseEducationLevelsTuple => {
	const { tText, tHtml } = useTranslation();

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
