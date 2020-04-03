import { isEmpty } from 'lodash-es';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { FormGroup, TagInfo, TagsInput } from '@viaa/avo2-components';

import { ToastService } from '../../../../shared/services';
import { fetchAllUserGroups } from '../../../../shared/services/user-groups-service';

export interface UserGroupSelectProps {
	label: string;
	error: string | undefined;
	placeholder: string;
	values: number[];
	required: boolean;
	onChange: (selectedUserGroupIds: number[]) => void;
}

export const UserGroupSelect: FunctionComponent<UserGroupSelectProps> = ({
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
		fetchAllUserGroups()
			.then(setUserGroupOptions)
			.catch((err: any) => {
				console.error('Failed to get user groups', err);
				ToastService.danger(
					t(
						'admin/shared/components/user-group-select/user-group-select___het-controleren-van-je-account-rechten-is-mislukt'
					),
					false
				);
			});
	}, [t]);

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
