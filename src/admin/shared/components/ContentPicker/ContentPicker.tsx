import { get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { ValueType } from 'react-select/src/types';

import {
	Column,
	Flex,
	FormGroup,
	Grid,
	RadioButton,
	RadioButtonGroup,
	TextInput,
} from '@viaa/avo2-components';
import toastService from '../../../../shared/services/toast-service';
import { CONTENT_TYPES } from '../../../content/content.const';
import { parsePickerItem } from '../../../shared/helpers';
import { PickerItem, PickerSelectItemGroup, PickerTypeOption } from '../../../shared/types';

type ContentPickerControls = 'content' | 'external-url';

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

	const [controls, setControls] = useState<ContentPickerControls>('content');
	const [loading, setLoading] = useState<boolean>(false);
	const [currentTypes, setCurrentTypes] = useState<PickerTypeOption[]>([]);
	const [groupedOptions, setGroupedOptions] = useState<PickerSelectItemGroup[]>([]);
	const [input, setInput] = useState<string>();

	const typeOptions = CONTENT_TYPES.filter((option: PickerTypeOption) =>
		selectableTypes ? selectableTypes.includes(option.value) : option.value
	);

	// Retrieve items when type is selected.
	useEffect(() => {
		if (currentTypes && currentTypes.length) {
			setLoading(true);
			const maxPerType = Math.floor(20 / currentTypes.length);
			const fetchChain = currentTypes.map(type => type.fetch(maxPerType));

			// Retrieve items for selected types.
			Promise.all(fetchChain)
				.then((data: PickerSelectItemGroup[]) => {
					setGroupedOptions(data);
					setLoading(false);
				})
				.catch(err => {
					console.error('Failed to inflate content picker.', err);
					toastService.danger(
						t(
							'admin/content/components/content-picker/content-picker___het-ophalen-van-de-content-items-is-mislukt'
						),
						false
					);
				});
		}
	}, [currentTypes, t]);

	const onChangeText = (value: string) => {
		setInput(value);
		onSelect(parsePickerItem('EXTERNAL_LINK', value));
	};

	const onChangeType = (currentValues: ValueType<PickerTypeOption>) => {
		setCurrentTypes((currentValues as PickerTypeOption[]) || []);
	};

	const renderGroupLabel = (data: any) => <span>{data.label}</span>;

	const renderSelectPicker = () => (
		<Grid>
			<Column size="1">
				<ReactSelect
					{...REACT_SELECT_DEFAULT_OPTIONS}
					id="content-picker-type"
					placeholder={t('admin/content/components/content-picker/content-picker___type')}
					options={typeOptions}
					isSearchable={false}
					isMulti={true}
					isOptionDisabled={(option: PickerTypeOption) => !!option.disabled}
					onChange={onChangeType}
				/>
			</Column>
			<Column size="3">
				<ReactSelect
					{...REACT_SELECT_DEFAULT_OPTIONS}
					id="content-picker-query"
					placeholder={t('admin/content/components/content-picker/content-picker___item')}
					formatGroupLabel={renderGroupLabel}
					options={groupedOptions as any}
					isSearchable={false}
					isDisabled={!currentTypes.length}
					isLoading={loading}
					onChange={(selectedItem: ValueType<PickerItem>) => onSelect(get(selectedItem, 'value'))}
				/>
			</Column>
		</Grid>
	);

	const renderInputPicker = () => <TextInput value={input} onChange={onChangeText} />;

	const renderEditor = () => {
		switch (controls) {
			case 'content':
				return renderSelectPicker();
			case 'external-url':
				return renderInputPicker();
			default:
				return null;
		}
	};

	return (
		<>
			<RadioButtonGroup>
				<Flex orientation="horizontal" spaced="wide">
					<RadioButton
						label={t('Content')}
						name="content"
						value="content"
						checked={controls === 'content'}
						onChange={() => setControls('content')}
					/>
					<RadioButton
						label={t('Externe URL')}
						name="external-url"
						value="external-url"
						checked={controls === 'external-url'}
						onChange={() => setControls('external-url')}
					/>
				</Flex>
			</RadioButtonGroup>
			<FormGroup error={errors}>{renderEditor()}</FormGroup>
		</>
	);
};

export default ContentPicker;
