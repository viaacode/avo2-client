import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { UserService } from '../../admin/users/user.service';
import { CustomError } from '../helpers';
import { ToastService } from '../services';

type UseIdpsTuple = [string[], boolean];

export const useIdps = (): UseIdpsTuple => {
	const [t] = useTranslation();

	const [idps, setIdps] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		UserService.fetchIdps()
			.then((idps: string[]) => {
				setIdps(idps);
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get idps from the database', err));
				ToastService.danger(t('shared/hooks/use-idps___ophalen-van-de-idps-is-mislukt'));
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [t]);

	return [idps, isLoading];
};
