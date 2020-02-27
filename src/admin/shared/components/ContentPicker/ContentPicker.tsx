import { get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import AsyncSelect from 'react-select/async';
import { ActionMeta, ValueType } from 'react-select/src/types';

import { Column, FormGroup, Grid, TextInput } from '@viaa/avo2-components';

import { CustomError } from '../../../../shared/helpers';
import { toastService } from '../../../../shared/services';

import { parsePickerItem } from '../../../shared/helpers';
import {
	ContentPickerType,
	PickerItem,
	PickerSelectItem,
	PickerTypeOption,
} from '../../../shared/types';
import { CONTENT_TYPES, REACT_SELECT_DEFAULT_OPTIONS } from './ContentPicker.const';
import { filterTypes, setInitialInput, setInitialItem } from './ContentPicker.helpers';

export interface ContentPickerProps {
	onSelect: (value: ValueType<PickerItem>) => void;
	allowedTypes?: ContentPickerType[];
	errors?: string | string[];
	currentSelection?: PickerItem;
}

export const ContentPicker: FunctionComponent<ContentPickerProps> = ({
	allowedTypes,
	onSelect,
	errors = [],
	currentSelection,
}) => {
	const typeOptions = filterTypes(CONTENT_TYPES, allowedTypes || []);
	const currentTypeObject = typeOptions.find(
		type => type.value === get(currentSelection, 'type')
	);

	const [t] = useTranslation();

	const [currentType, setCurrentType] = useState<PickerTypeOption<ContentPickerType>>(
		currentTypeObject || typeOptions[0]
	);
	const [options, setOptions] = useState<PickerSelectItem[]>([]);
	const [input, setInput] = useState<string>(
		setInitialInput(currentTypeObject, currentSelection)
	);
	const [currentItem, setCurrentItem] = useState<ValueType<PickerItem> | null>(
		setInitialItem(options, currentSelection)
	);

	// inflate content picker
	const inflatePicker = (keyword: string | null, callback: any) => {
		if (currentType && !!currentType.fetch) {
			currentType
				.fetch(keyword, 20)
				.then((items: any) => {
					callback((items as any) || []);

					setCurrentItem(null);
				})
				.catch((error: any) => {
					console.error('[Content Picker] - Failed to inflate.', error);
					toastService.danger(
						t(
							'admin/content/components/content-picker/content-picker___het-ophalen-van-de-content-items-is-mislukt'
						),
						false
					);
				});
		}
	};

	useEffect(() => {
		inflatePicker(null, setOptions);
	}, [currentType]); // eslint-disable-line

	// events
	const onSelectType = (selected: ValueType<PickerTypeOption>) => {
		if (currentType !== selected) {
			setCurrentType(selected as PickerTypeOption);
			setCurrentItem(null);
		}
	};

	const onSelectItem = (selectedItem: ValueType<PickerItem>, event: ActionMeta) => {
		if (event.action === 'clear') {
			setCurrentItem(null);
		}

		if (!selectedItem) {
			return null;
		}

		const value = get(selectedItem, 'value', null);

		if (!get(value, 'value')) {
			onSelect(null);
			setCurrentItem(null);
			console.error(
				new CustomError('[Content Picker] - Selected item has no value.', null, {
					selectedItem,
				})
			);
			toastService.danger(
				t(
					'admin/shared/components/content-picker/content-picker___voor-deze-content-pagina-is-geen-pad-geconfigureerd'
				),
				false
			);
			return null;
		}

		onSelect(value);
		setCurrentItem(selectedItem);
	};

	const onChangeInput = (value: string) => {
		setInput(value);
		onSelect(parsePickerItem(get(currentType, 'value') as ContentPickerType, value));
	};

	// render controls
	const renderTypePicker = () => (
		<ReactSelect
			{...REACT_SELECT_DEFAULT_OPTIONS}
			id="content-picker-type"
			placeholder={t('Type')}
			aria-label={t('Selecteer een type')}
			options={typeOptions}
			onChange={onSelectType}
			value={currentType}
			isSearchable={false}
			isOptionDisabled={(option: PickerTypeOption) => !!option.disabled}
			noOptionsMessage={() => t('Geen types')}
		/>
	);

	const renderItemControl = () => {
		if (!currentType) {
			return null;
		}

		switch (currentType.picker) {
			case 'SELECT':
				return renderItemPicker();
			case 'TEXT_INPUT':
				return renderTextInputPicker();
			default:
				return null;
		}
	};

	const renderItemPicker = () => (
		<AsyncSelect
			{...REACT_SELECT_DEFAULT_OPTIONS}
			id="content-picker-item"
			placeholder={t('Selecteer een item')}
			aria-label={t('Selecteer een item')}
			loadOptions={inflatePicker}
			onChange={onSelectItem}
			value={currentItem}
			defaultOptions={options as any}
			isClearable
			noOptionsMessage={() => t('Geen resultaten')}
			loadingMessage={() => t('Laden...')}
		/>
	);

	const renderTextInputPicker = () => (
		<TextInput
			value={input}
			onChange={onChangeInput}
			placeholder={get(currentTypeObject, 'placeholder')}
		/>
	);

	return (
		<FormGroup error={errors}>
			<Grid>
				<Column size="1">{renderTypePicker()}</Column>
				<Column size="3">{renderItemControl()}</Column>
			</Grid>
		</FormGroup>
	);
};
