import { get } from 'lodash';
import { ValueType } from 'react-select/src/types';

import {
	ContentPickerType,
	PickerItem,
	PickerSelectItem,
	PickerTypeOption,
} from '../../../shared/types';

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
	currentSelection?: PickerItem
) => {
	const isInput = get(type, 'picker') === 'TEXT_INPUT';

	return isInput ? get(currentSelection, 'value', '') : '';
};

export const setInitialItem = (options: PickerSelectItem[], currentSelection?: PickerItem) => {
	return options.find((option: PickerSelectItem) => {
		return (
			get(option, 'value.value', 'EMPTY_OPTION') ===
			get(currentSelection, 'value', 'EMPTY_SELECTION')
		);
	}) as ValueType<PickerItem>;
};
