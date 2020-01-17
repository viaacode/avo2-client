import { get } from 'lodash';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import ReactSelect from 'react-select';
import { ValueType } from 'react-select/src/types';

import { Column, Grid } from '@viaa/avo2-components';

import { CONTENT_TYPES } from '../../content.const';
import { PickerItem, PickerTypeOption } from '../../content.types';

import './ContentPicker.scss';

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
	const [groupedOptions, setGroupedOptions] = useState<any[]>([]);

	const typeOptions = CONTENT_TYPES.filter((option: PickerTypeOption) =>
		selectableTypes ? selectableTypes.includes(option.value) : option.value
	);

	// Retrieve items when type is selected.
	useEffect(() => {
		if (currentTypes && currentTypes.length) {
			setLoading(true);

			const maxPerType = 20 / currentTypes.length;
			const fetchChain = currentTypes.map(type => type.fetch(maxPerType));

			// Retrieve items for selected types.
			Promise.all(fetchChain).then((data: any) => {
				setGroupedOptions(data);
				setLoading(false);
			});
		}
	}, [currentTypes]);

	const onTypeChange = (currentValues: ValueType<PickerTypeOption>) => {
		setCurrentTypes((currentValues as PickerTypeOption[]) || []);
	};

	// TODO: Translations
	return (
		<Grid>
			<Column size="1">
				<ReactSelect
					className="c-select"
					classNamePrefix="c-select"
					id="content-picker"
					options={typeOptions}
					isMulti={true}
					isSearchable={false}
					isOptionDisabled={(option: PickerTypeOption) => !!option.disabled}
					onChange={onTypeChange}
					placeholder={t('Type')}
				/>
			</Column>
			<Column size="3">
				<ReactSelect
					className="c-select"
					classNamePrefix="c-select"
					id="content-picker"
					formatGroupLabel={data => <span>{data.label}</span>}
					options={groupedOptions}
					isSearchable={false}
					isDisabled={!currentTypes.length}
					isLoading={loading}
					onChange={(selectedItem: ValueType<PickerItem>) => onSelect(get(selectedItem, 'value'))}
					placeholder={t('Item')}
				/>
			</Column>
		</Grid>
	);
};
