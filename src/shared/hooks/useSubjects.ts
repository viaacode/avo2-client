import { useEffect, useState } from 'react';

import { SettingsService } from '../../settings/settings.service';
import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers';
import { ToastService } from '../services/toast-service';

type UseSubjectsTuple = [string[], boolean];

export const useSubjects = (): UseSubjectsTuple => {
	const { tText, tHtml } = useTranslation();

	const [subjects, setSubjects] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		SettingsService.fetchSubjects()
			.then((subjects: string[]) => {
				setSubjects(subjects);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get subjects from the database', err));
				ToastService.danger(
					tHtml('settings/components/profile___het-ophalen-van-de-vakken-is-mislukt')
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tText]);

	return [subjects, isLoading];
};
