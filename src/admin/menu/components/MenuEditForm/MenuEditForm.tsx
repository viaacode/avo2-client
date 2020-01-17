import { get, kebabCase } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { useTranslation } from 'react-i18next';
import { ValueType } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { Form, FormGroup, TextArea, TextInput } from '@viaa/avo2-components';

import { ReactSelectOption, ValueOf } from '../../../../shared/types';
import { ContentPicker } from '../../../content/components/ContentPicker/ContentPicker';
import { IconPicker } from '../../../shared/components';

import { MENU_ICON_OPTIONS } from '../../menu.const';
import { MenuEditFormState } from '../../menu.types';

interface MenuEditFormProps {
	formErrors: Partial<MenuEditFormState>;
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
				error={formErrors.link}
				label={t('admin/menu/components/menu-edit-form/menu-edit-form___link')}
				required
			>
				<TextInput onChange={(value: string) => onChange('link', value)} value={formState.link} />
			</FormGroup>
			<FormGroup label={t('Content')}>
				<ContentPicker onSelect={value => console.log(value)} />
			</FormGroup>
		</Form>
	);
};

export default MenuEditForm;
