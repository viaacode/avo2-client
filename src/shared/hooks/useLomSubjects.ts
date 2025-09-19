import { type Avo } from '@viaa/avo2-types';
import { useEffect, useState } from 'react';

import { useTranslation } from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers/custom-error';
import { LomService } from '../services/lom.service';
import { ToastService } from '../services/toast-service';

type UseLomSubjectsTuple = [Avo.Lom.LomField[], boolean];

export const useLomSubjects = (): UseLomSubjectsTuple => {
	const { tText, tHtml } = useTranslation();

	const [subjects, setSubjects] = useState<Avo.Lom.LomField[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		LomService.fetchSubjects()
			.then((subjects: Avo.Lom.LomField[]) => {
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
	}, [tHtml, tText]);

	return [subjects, isLoading];
};
