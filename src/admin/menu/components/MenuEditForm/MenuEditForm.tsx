import { capitalize, get, kebabCase, sortBy } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ValueType } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import {
	Form,
	FormGroup,
	Select,
	TagInfo,
	TagsInput,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';

import { UserGroup } from '../../../../shared/services/user-groups-service';
import { ReactSelectOption, ValueOf } from '../../../../shared/types';
import { IconPicker } from '../../../shared/components';

import { MENU_ICON_OPTIONS } from '../../menu.const';
import { MenuEditFormState } from '../../menu.types';

interface MenuEditFormProps {
	formErrors: Partial<MenuEditFormState>;
	formState: MenuEditFormState;
	menuParentId: string | undefined;
	menuParentOptions: ReactSelectOption<string>[];
	userGroups: UserGroup[];
	onChange: (key: keyof MenuEditFormState, value: ValueOf<MenuEditFormState>) => void;
}

const MenuEditForm: FunctionComponent<MenuEditFormProps> = ({
	formErrors,
	formState,
	menuParentId,
	menuParentOptions,
	userGroups,
	onChange,
}) => {
	const [t] = useTranslation();

	const handleMenuCreate = (label: string) => {
		return {
			label,
			value: kebabCase(label),
		};
	};

	const userGroupOptions: TagInfo[] = sortBy(
		[
			{ label: t('Niet ingelogde gebruikers'), value: -1 },
			{ label: t('Ingelogde gebruikers'), value: -2 },
			...userGroups.map(
				(userGroup): TagInfo => ({ label: capitalize(userGroup.label), value: userGroup.id })
			),
		],
		'label'
	);

	const handleUserGroupChange = (selectedValues: TagInfo[]) => {
		onChange('group_access', (selectedValues || []).map(val => val.value as number));
	};

	return (
		<Form>
			<FormGroup
				error={formErrors.placement}
				label={t('admin/menu/components/menu-edit-form/menu-edit-form___navigatie-naam')}
				required
			>
				{/* TODO: Add CreatableSelect to compononents lib */}
				<CreatableSelect
					value={menuParentOptions.find(opt => opt.value === menuParentId)}
					formatCreateLabel={inputValue => `Aanmaken: ${inputValue}`}
					getNewOptionData={handleMenuCreate}
					onChange={(option: ValueType<ReactSelectOption<string>>) =>
						onChange('placement', get(option, 'value', ''))
					}
					options={menuParentOptions}
					placeholder={t(
						'admin/menu/components/menu-edit-form/menu-edit-form___selecteer-of-maak-een-navigatie-aan'
					)}
					isDisabled={!!menuParentId}
				/>
			</FormGroup>
			{!menuParentId && (
				<FormGroup
					error={formErrors.description}
					label={t('admin/menu/components/menu-edit-form/menu-edit-form___navigatie-omschrijving')}
				>
					<TextArea
						onChange={(value: string) => onChange('description', value)}
						value={formState.description}
					/>
				</FormGroup>
			)}
			<FormGroup label={t('admin/menu/components/menu-edit-form/menu-edit-form___icoon')}>
				<IconPicker
					options={MENU_ICON_OPTIONS}
					onChange={(option: ValueType<ReactSelectOption<string>>) =>
						onChange('icon', get(option, 'value', ''))
					}
					value={MENU_ICON_OPTIONS.find(
						(option: ReactSelectOption<string>) => option.value === formState.icon
					)}
				/>
			</FormGroup>
			<FormGroup
				error={formErrors.label}
				label={t('admin/menu/components/menu-edit-form/menu-edit-form___label')}
				required
			>
				<TextInput onChange={(value: string) => onChange('label', value)} value={formState.label} />
			</FormGroup>
			<FormGroup
				error={formErrors.external_link}
				label={t('admin/menu/components/menu-edit-form/menu-edit-form___link')}
				required
			>
				<TextInput
					onChange={(value: string) => onChange('external_link', value)}
					value={formState.external_link}
				/>
				{/* TODO replace by content picker widget that can pick internal pages, external urls and content block pages */}
			</FormGroup>
			<FormGroup error={formErrors.link_target} label={t('Openen in')} required>
				<Select
					options={[
						{ label: t('Nieuw venster'), value: '_blank' },
						{ label: t('Hetzelfde venster'), value: '_self' },
					]}
					onChange={(value: string) => onChange('link_target', value)}
					value={formState.link_target || '_self'}
				/>
			</FormGroup>
			<FormGroup error={formErrors.link_target} label={t('Zichtbaar voor')} required>
				<TagsInput
					placeholder={t('Niemand')}
					options={userGroupOptions}
					onChange={handleUserGroupChange}
					value={userGroupOptions.filter((userGroupOption: TagInfo) =>
						formState.group_access.includes(userGroupOption.value as number)
					)}
				/>
			</FormGroup>
		</Form>
	);
};

export default MenuEditForm;
