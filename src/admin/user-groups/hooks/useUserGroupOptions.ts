import { TagInfo } from '@viaa/avo2-components';
import { useEffect, useState } from 'react';

import { CheckboxOption } from '../../../shared/components';
import { CustomError } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { GET_SPECIAL_USER_GROUPS } from '../user-group.const';
import { UserGroupService } from '../user-group.service';

type UseUserGroupsTuple = [TagInfo[] | CheckboxOption[], boolean];

export const useUserGroupOptions = (
	type: 'CheckboxOption' | 'TagInfo',
	includeSpecialGroups: boolean
): UseUserGroupsTuple => {
	const { tText, tHtml } = useTranslation();
	const [userGroupOptions, setUserGroupOptions] = useState<TagInfo[] | CheckboxOption[]>([]);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	useEffect(() => {
		setIsLoading(true);

		UserGroupService.fetchAllUserGroups()
			.then((options) => {
				const allOptions = [
					...(includeSpecialGroups ? GET_SPECIAL_USER_GROUPS() : []),
					...options,
				];
				if (type === 'TagInfo') {
					setUserGroupOptions(
						allOptions.map(
							(opt): TagInfo => ({
								label: opt.label as string,
								value: String(opt.id),
							})
						)
					);
				} else {
					setUserGroupOptions(
						allOptions.map(
							(opt): CheckboxOption => ({
								label: opt.label as string,
								id: String(opt.id),
								checked: false,
							})
						)
					);
				}
			})
			.catch((err) => {
				console.error(new CustomError('Failed to get user group options', err));
				ToastService.danger(
					tHtml(
						'admin/user-groups/hooks/use-user-group-options___het-ophalen-van-de-gebruikergroep-opties-is-mislukt'
					)
				);
			})
			.finally(() => {
				setIsLoading(false);
			});
	}, [setIsLoading, setUserGroupOptions, includeSpecialGroups, type, tText]);

	return [userGroupOptions, isLoading];
};
