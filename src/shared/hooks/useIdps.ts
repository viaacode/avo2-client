import { useEffect, useState } from 'react';

import { UserService } from '../../admin/users/user.service';
import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers';
import { ToastService } from '../services/toast-service';

type UseIdpsTuple = [string[], boolean];

export const useIdps = (): UseIdpsTuple => {
	const { tText, tHtml } = useTranslation();

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
				ToastService.danger(
					tHtml('shared/hooks/use-idps___ophalen-van-de-idps-is-mislukt')
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tText]);

	return [idps, isLoading];
};
