import { ContentPickerType, PickerItem } from '../../types';

export const parsePickerItem = (type: ContentPickerType, value: string): PickerItem => ({
	type,
	value,
});
