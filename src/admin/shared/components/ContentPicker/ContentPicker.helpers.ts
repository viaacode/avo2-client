import { ContentPickerType } from '@viaa/avo2-components';
import { PropsValue } from 'react-select/dist/react-select.cjs';

import { PickerItem, PickerItemControls, PickerTypeOption } from '../../types';

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
	options: PickerItem[],
	initialValue?: PickerItem
): PropsValue<PickerItem> | undefined => {
	return options.find(
		(option: PickerItem) => option.value === (initialValue?.value || 'EMPTY_SELECTION')
	) as PropsValue<PickerItem> | undefined;
};
