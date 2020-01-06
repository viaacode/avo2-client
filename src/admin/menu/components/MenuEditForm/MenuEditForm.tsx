import { get, kebabCase } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { ValueType } from 'react-select';
import CreatableSelect from 'react-select/creatable';

import { Form, FormGroup, TextArea, TextInput } from '@viaa/avo2-components';

import { ReactSelectOption, ValueOf } from '../../../../shared/types';
import { IconPicker } from '../../../shared/components';

import { MENU_ICON_OPTIONS } from '../../menu.const';
import { MenuEditComponentState } from '../../menu.types';

interface MenuEditFormProps {
	formErrors: Partial<MenuEditComponentState>;
	componentState: MenuEditComponentState;
	menuParentId: string | undefined;
	menuParentOptions: ReactSelectOption<string>[];
	onChange: (key: keyof MenuEditComponentState, value: ValueOf<MenuEditComponentState>) => void;
}

const MenuEditForm: FunctionComponent<MenuEditFormProps> = ({
	formErrors,
	componentState,
	menuParentId,
	menuParentOptions,
	onChange,
}) => {
	const handleMenuCreate = (label: string) => {
		return {
			label,
			value: kebabCase(label),
		};
	};

	return (
		<Form>
			<FormGroup error={formErrors.placement} label="Navigatie naam" required>
				{/* TODO: Add CreatableSelect to compononents lib */}
				<CreatableSelect
					value={menuParentOptions.find(opt => opt.value === menuParentId)}
					formatCreateLabel={inputValue => `Aanmaken: ${inputValue}`}
					getNewOptionData={handleMenuCreate}
					onChange={(option: ValueType<ReactSelectOption<string>>) =>
						onChange('placement', get(option, 'value', ''))
					}
					options={menuParentOptions}
					placeholder="Selecteer of maak een navigatie aan"
					isDisabled={!!menuParentId}
				/>
			</FormGroup>
			{!menuParentId && (
				<FormGroup error={formErrors.description} label="Navigatie omschrijving">
					<TextArea
						onChange={(value: string) => onChange('description', value)}
						value={componentState.description}
					/>
				</FormGroup>
			)}
			<FormGroup label="Icoon">
				<IconPicker
					options={MENU_ICON_OPTIONS}
					onChange={(option: ValueType<ReactSelectOption<string>>) =>
						onChange('icon', get(option, 'value', ''))
					}
					value={MENU_ICON_OPTIONS.find(
						(option: ReactSelectOption<string>) => option.value === componentState.icon
					)}
				/>
			</FormGroup>
			<FormGroup error={formErrors.label} label="Label" required>
				<TextInput
					onChange={(value: string) => onChange('label', value)}
					value={componentState.label}
				/>
			</FormGroup>
			<FormGroup error={formErrors.link} label="Link" required>
				<TextInput
					onChange={(value: string) => onChange('link', value)}
					value={componentState.link}
				/>
			</FormGroup>
		</Form>
	);
};

export default MenuEditForm;
