import { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { TagInfo } from '@viaa/avo2-components';

import { CustomError } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { UserGroupService } from '../user-group.service';

type UseUserGroupsTuple = [TagInfo[], boolean];

export const useUserGroupOptions = (): UseUserGroupsTuple => {
	const [t] = useTranslation();
	const [userGroupOptions, setUserGroupOptions] = useState<TagInfo[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		UserGroupService.fetchAllUserGroupTagInfos()
			.then(options => {
				if (options) {
					setUserGroupOptions(options);
				}
			})
			.catch(err => {
				console.error(new CustomError('Failed to get user group options', err));
				ToastService.danger(
					t(
						'admin/user-groups/hooks/use-user-group-options___het-ophalen-van-de-gebruikergroep-opties-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [setIsLoading, setUserGroupOptions, t]);

	return [userGroupOptions, isLoading];
};
