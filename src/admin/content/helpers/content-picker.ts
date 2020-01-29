import { ContentPickerType, PickerItem } from '../content.types';

export const parsePickerItem = (type: ContentPickerType, value: string): PickerItem => ({
	type,
	value,
});
