import { useEffect, useState } from 'react';

import { UserService } from '../../admin/users/user.service';
import useTranslation from '../../shared/hooks/useTranslation';
import { CustomError } from '../helpers';
import { ToastService } from '../services/toast-service';

type UseBusinessCategoriesTuple = [string[], boolean];

export const useBusinessCategories = (): UseBusinessCategoriesTuple => {
	const { tText, tHtml } = useTranslation();

	const [businessCategories, setBusinessCategories] = useState<string[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		UserService.fetchDistinctBusinessCategories()
			.then(setBusinessCategories)
			.catch((err) => {
				console.error(
					new CustomError('Failed to get distinct business categories from database', err)
				);
				ToastService.danger(
					tHtml(
						'shared/hooks/use-business-category___het-ophalen-van-de-oormerken-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [tText]);

	return [businessCategories, isLoading];
};
