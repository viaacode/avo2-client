import { ContentPickerType } from '@viaa/avo2-components';
import { get } from 'lodash';
// eslint-disable-next-line import/namespace
import { ValueType } from 'react-select/src/types';

import { PickerItem, PickerItemControls, PickerSelectItem, PickerTypeOption } from '../../types';

export const filterTypes = (
	types: PickerTypeOption<ContentPickerType>[],
	allowedTypes: ContentPickerType[]
): PickerTypeOption<ContentPickerType>[] => {
	return types.filter((option: PickerTypeOption) => {
		return allowedTypes.length ? allowedTypes.includes(option.value) : option.value;
	});
};

export const setInitialInput = (
	type?: PickerTypeOption<ContentPickerType>,
	initialValue?: PickerItem
): string => {
	switch (type?.picker as PickerItemControls) {
		case 'TEXT_INPUT':
		case 'FILE_UPLOAD':
			return initialValue?.value || '';

		default:
			return '';
	}
};

export const setInitialItem = (
	options: PickerSelectItem[],
	initialValue?: PickerItem
): ValueType<PickerItem, any> => {
	return options.find(
		(option: PickerSelectItem) =>
			option.value.value === get(initialValue, 'value', 'EMPTY_SELECTION')
	) as ValueType<PickerItem, any>;
};
