import { capitalize, isEmpty, sortBy } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormGroup, TagInfo, TagsInput } from '@viaa/avo2-components';

import toastService from '../../../../shared/services/toast-service';
import { getUserGroups } from '../../../../shared/services/user-groups-service';

interface UserGroupSelectProps {
	label: string;
	error: string | undefined;
	placeholder: string;
	values: number[];
	required: boolean;
	onChange: (selectedUserGroupIds: number[]) => void;
}

const UserGroupSelect: FunctionComponent<UserGroupSelectProps> = ({
	label,
	error,
	placeholder,
	values,
	onChange,
	required,
}) => {
	const [t] = useTranslation();
	const [userGroupOptions, setUserGroupOptions] = useState<TagInfo[]>([]);

	useEffect(() => {
		// fetch user groups for giving permissions to view a certain navigation item
		getUserGroups()
			.then((userGroups: { label: string; id: number }[]) => {
				setUserGroupOptions(
					sortBy(
						[
							{
								label: t(
									'admin/menu/components/menu-edit-form/menu-edit-form___niet-ingelogde-gebruikers'
								),
								value: -1,
							},
							{
								label: t(
									'admin/menu/components/menu-edit-form/menu-edit-form___ingelogde-gebruikers'
								),
								value: -2,
							},
							...userGroups.map(
								(userGroup): TagInfo => ({
									label: capitalize(userGroup.label),
									value: userGroup.id,
								})
							),
						],
						'label'
					)
				);
			})
			.catch((err: any) => {
				console.error('Failed to get user groups', err);
				toastService.danger(t('Het controleren van je account rechten is mislukt'));
			});
	}, []);

	const handleSelectOnChange = (values: TagInfo[] | null) => {
		onChange((values || []).map(val => val.value as number));
	};

	const selectedOptions = userGroupOptions.filter((userGroupOption: TagInfo) => {
		return values.includes(userGroupOption.value as number);
	});

	if (isEmpty(userGroupOptions)) {
		return null;
	}
	return (
		<FormGroup error={error} label={label} required={required}>
			<TagsInput
				placeholder={placeholder}
				options={userGroupOptions}
				onChange={handleSelectOnChange}
				value={selectedOptions}
			/>
		</FormGroup>
	);
};

export default UserGroupSelect;
