import { get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { ValueType } from 'react-select/src/types';

import { Column, FormGroup, Grid, TextInput } from '@viaa/avo2-components';

import toastService from '../../../../shared/services/toast-service';
import { parsePickerItem } from '../../../shared/helpers';
import { PickerItem, PickerSelectItem, PickerTypeOption } from '../../../shared/types';

import { CONTENT_TYPES } from './ContentPicker.const';

const REACT_SELECT_DEFAULT_OPTIONS = {
	className: 'c-select',
	classNamePrefix: 'c-select',
};

export interface ContentPickerProps {
	selectableTypes?: string[];
	onSelect: (value: ValueType<PickerItem>) => void;
	errors?: string | string[];
}

const ContentPicker: FunctionComponent<ContentPickerProps> = ({
	selectableTypes,
	onSelect,
	errors = [],
}) => {
	const [t] = useTranslation();

	const [loading, setLoading] = useState<boolean>(false);
	const [currentType, setCurrentType] = useState<PickerTypeOption>();
	const [options, setOptions] = useState<PickerSelectItem[]>([]);
	const [input, setInput] = useState<string>();

	const typeOptions = CONTENT_TYPES.filter((option: PickerTypeOption) =>
		selectableTypes ? selectableTypes.includes(option.value) : option.value
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
				})
				.catch(error => {
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
			onChange={(selectedItem: ValueType<PickerItem>) => onSelect(get(selectedItem, 'value'))}
		/>
	);

	const renderTextInputPicker = () => <TextInput value={input} onChange={onChangeText} />;

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
					/>
				</Column>
				<Column size="3">{renderContentPickerControls()}</Column>
			</Grid>
		</FormGroup>
	);
};

export default ContentPicker;
