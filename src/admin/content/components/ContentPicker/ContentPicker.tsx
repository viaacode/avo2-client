import { get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { ValueType } from 'react-select/src/types';

import { Column, Grid } from '@viaa/avo2-components';

import toastService from '../../../../shared/services/toast-service';
import i18n from '../../../../shared/translations/i18n';
import { CONTENT_TYPES } from '../../content.const';
import { PickerItem, PickerSelectItemGroup, PickerTypeOption } from './ContentPicker.types';

const REACT_SELECT_DEFAULT_OPTIONS = {
	className: 'c-select',
	classNamePrefix: 'c-select',
};

export interface ContentPickerProps {
	selectableTypes?: string[];
	onSelect: (value: ValueType<PickerItem>) => void;
}

export const ContentPicker: FunctionComponent<ContentPickerProps> = ({
	selectableTypes,
	onSelect,
}) => {
	const [t] = useTranslation();

	const [loading, setLoading] = useState<boolean>(false);
	const [currentTypes, setCurrentTypes] = useState<PickerTypeOption[]>([]);
	const [groupedOptions, setGroupedOptions] = useState<PickerSelectItemGroup[]>([]);

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
					toastService.danger(i18n.t('Het ophalen van de content items is mislukt.'), false);
				});
		}
	}, [currentTypes]);

	const onTypeChange = (currentValues: ValueType<PickerTypeOption>) => {
		setCurrentTypes((currentValues as PickerTypeOption[]) || []);
	};

	const renderGroupLabel = (data: any) => <span>{data.label}</span>;

	return (
		<Grid>
			<Column size="1">
				<ReactSelect
					{...REACT_SELECT_DEFAULT_OPTIONS}
					id="content-picker-type"
					placeholder={t('admin/content/components/content-picker/content-picker___type')}
					options={typeOptions}
					isMulti={true}
					isSearchable={false}
					isOptionDisabled={(option: PickerTypeOption) => !!option.disabled}
					onChange={onTypeChange}
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
};
