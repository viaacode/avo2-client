import { get, kebabCase } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import CreatableSelect from 'react-select/creatable';
import { ValueType } from 'react-select/src/types';

import { Form, FormGroup, Select, TextArea, TextInput } from '@viaa/avo2-components';

import { ReactSelectOption, ValueOf } from '../../../../shared/types';
import { ContentPicker } from '../../../content/components/ContentPicker/ContentPicker';
import { PickerItem } from '../../../content/content.types';
import { IconPicker } from '../../../shared/components';

import UserGroupSelect from '../../../shared/components/UserGroupSelect/UserGroupSelect';
import { MENU_ICON_OPTIONS } from '../../menu.const';
import { MenuEditFormErrorState, MenuEditFormState } from '../../menu.types';

interface MenuEditFormProps {
	formErrors: MenuEditFormErrorState;
	formState: MenuEditFormState;
	menuParentId: string | undefined;
	menuParentOptions: ReactSelectOption<string>[];
	onChange: (key: keyof MenuEditFormState, value: ValueOf<MenuEditFormState>) => void;
}

const MenuEditForm: FunctionComponent<MenuEditFormProps> = ({
	formErrors,
	formState,
	menuParentId,
	menuParentOptions,
	onChange,
}) => {
	const [t] = useTranslation();

	const handleMenuCreate = (label: string) => {
		return {
			label,
			value: kebabCase(label),
		};
	};

	return (
		<Form>
			<FormGroup
				error={formErrors.placement}
				label={t('admin/menu/components/menu-edit-form/menu-edit-form___navigatie-naam')}
				required
			>
				{/* TODO: Add CreatableSelect to components lib */}
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
				<ContentPicker
					onSelect={(item: ValueType<PickerItem>) =>
						onChange('external_link', (item as PickerItem).value)
					}
				/>
			</FormGroup>
			<FormGroup
				error={formErrors.link_target}
				label={t('admin/menu/components/menu-edit-form/menu-edit-form___openen-in')}
				required
			>
				<Select
					options={[
						{
							label: t('admin/menu/components/menu-edit-form/menu-edit-form___nieuw-venster'),
							value: '_blank',
						},
						{
							label: t('admin/menu/components/menu-edit-form/menu-edit-form___hetzelfde-venster'),
							value: '_self',
						},
					]}
					onChange={(value: string) => onChange('link_target', value)}
					value={formState.link_target || '_self'}
				/>
			</FormGroup>
			<UserGroupSelect
				label={t('admin/menu/components/menu-edit-form/menu-edit-form___zichtbaar-voor')}
				error={formErrors.group_access}
				placeholder={t('admin/menu/components/menu-edit-form/menu-edit-form___niemand')}
				values={formState.group_access}
				required={false}
				onChange={(userGroupIds: number[]) => onChange('group_access', userGroupIds)}
			/>
		</Form>
	);
};

export default MenuEditForm;
