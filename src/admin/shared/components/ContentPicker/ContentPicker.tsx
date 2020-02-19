import { get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { ValueType } from 'react-select/src/types';

import { Column, FormGroup, Grid, TextInput } from '@viaa/avo2-components';

import toastService from '../../../../shared/services/toast-service';
import i18n from '../../../../shared/translations/i18n';
import { parsePickerItem } from '../../../shared/helpers';
import { PickerItem, PickerSelectItem, PickerTypeOption } from '../../../shared/types';

import { CustomError } from '../../../../shared/helpers';
import { CONTENT_TYPES } from './ContentPicker.const';

export const REACT_SELECT_DEFAULT_OPTIONS = {
	className: 'c-select',
	classNamePrefix: 'c-select',
};

export interface ContentPickerProps {
	onSelect: (value: ValueType<PickerItem>) => void;
	selectableTypes?: string[];
	errors?: string | string[];
	currentSelection?: PickerItem;
}

const ContentPicker: FunctionComponent<ContentPickerProps> = ({
	selectableTypes,
	onSelect,
	errors = [],
	currentSelection,
}) => {
	const typeOptions = CONTENT_TYPES.filter((option: PickerTypeOption) =>
		selectableTypes ? selectableTypes.includes(option.value) : option.value
	);
	const currentTypeObject = typeOptions.find(
		type => type.value === get(currentSelection, 'type')
	) as PickerTypeOption;

	const [t] = useTranslation();

	const [loading, setLoading] = useState<boolean>(false);
	const [currentType, setCurrentType] = useState<PickerTypeOption>(
		currentTypeObject || typeOptions[0]
	);
	const [options, setOptions] = useState<PickerSelectItem[]>([]);
	const [input, setInput] = useState<string>(
		get(currentTypeObject, 'picker') === 'TEXT_INPUT' ? get(currentSelection, 'value', '') : ''
	);
	const [currentValue, setCurrentValue] = useState<ValueType<PickerItem> | null>(
		options.find(
			option =>
				get(option, 'value.value', 'EMPTY_OPTION') ===
				get(currentSelection, 'value', 'EMPTY_SELECTION')
		) as ValueType<PickerItem>
	);

	useEffect(() => {
		if (currentType && !!currentType.fetch) {
			setLoading(true);

			// Retrieve items for selected type.
			currentType
				.fetch(20)
				.then(items => {
					setOptions(items || []);
					setLoading(false);
					setCurrentValue(null);
				})
				.catch(error => {
					setLoading(false);
					console.error('Failed to inflate content picker.', error);
					toastService.danger(
						t(
							'admin/content/components/content-picker/content-picker___het-ophalen-van-de-content-items-is-mislukt'
						),
						false
					);
				});
		}
	}, [currentType, t]);

	const onChangeText = (value: string) => {
		setInput(value);
		onSelect(parsePickerItem('EXTERNAL_LINK', value));
	};

	const onChangeType = (selected: ValueType<PickerTypeOption>) => {
		setCurrentType(selected as PickerTypeOption);
		setCurrentValue(null);
	};

	const renderGroupLabel = (data: any) => <span>{data.label}</span>;

	const renderContentPickerControls = () => {
		if (!currentType) {
			return null;
		}

		switch (currentType.picker) {
			case 'SELECT':
				return renderSelectPicker();
			case 'TEXT_INPUT':
				return renderTextInputPicker();
			default:
				return null;
		}
	};

	const renderSelectPicker = () => (
		<ReactSelect
			{...REACT_SELECT_DEFAULT_OPTIONS}
			id="content-picker-query"
			placeholder={t('admin/content/components/content-picker/content-picker___item')}
			formatGroupLabel={renderGroupLabel}
			options={options as any}
			isSearchable={false}
			isLoading={loading}
			onChange={(selectedItem: ValueType<PickerItem>) => {
				const value = get(selectedItem, 'value', null);

				if (!get(value, 'value')) {
					onSelect(null);
					setCurrentValue(null);
					console.error(
						new CustomError('Selected content in content picker does not have a value', null, {
							selectedItem,
						})
					);
					toastService.danger(
						i18n.t(
							'admin/shared/components/content-picker/content-picker___voor-deze-content-pagina-is-geen-pad-geconfigureerd'
						),
						false
					);
					return;
				}

				onSelect(value);
				setCurrentValue(selectedItem);
			}}
			value={currentValue}
		/>
	);

	const renderTextInputPicker = () => (
		<TextInput value={input} onChange={onChangeText} placeholder="http://www.meemoo.be" />
	);

	return (
		<FormGroup error={errors}>
			<Grid>
				<Column size="1">
					<ReactSelect
						{...REACT_SELECT_DEFAULT_OPTIONS}
						id="content-picker-type"
						placeholder={t('admin/content/components/content-picker/content-picker___type')}
						options={typeOptions}
						isSearchable={false}
						isOptionDisabled={(option: PickerTypeOption) => !!option.disabled}
						onChange={onChangeType}
						value={currentType}
					/>
				</Column>
				<Column size="3">{renderContentPickerControls()}</Column>
			</Grid>
		</FormGroup>
	);
};

export default ContentPicker;
