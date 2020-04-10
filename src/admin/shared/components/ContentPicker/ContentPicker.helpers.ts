import { get } from 'lodash';
import { ValueType } from 'react-select/src/types';

import { ContentPickerType, PickerItem, PickerSelectItem, PickerTypeOption } from '../../types';

export const filterTypes = (
	types: PickerTypeOption<ContentPickerType>[],
	allowedTypes: ContentPickerType[]
) => {
	return types.filter((option: PickerTypeOption) => {
		return allowedTypes.length ? allowedTypes.includes(option.value) : option.value;
	});
};

export const setInitialInput = (
	type?: PickerTypeOption<ContentPickerType>,
	initialValue?: PickerItem
) => {
	const isInput = get(type, 'picker') === 'TEXT_INPUT';

	return isInput ? get(initialValue, 'value', '') : '';
};

export const setInitialItem = (
	options: PickerSelectItem[],
	initialValue?: PickerItem
): ValueType<PickerItem> => {
	return options.find(
		(option: PickerSelectItem) =>
			option.value.value === get(initialValue, 'value', 'EMPTY_SELECTION')
	) as ValueType<PickerItem>;
};
