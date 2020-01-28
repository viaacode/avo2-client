import { PickerItem } from '../../content.types';

export const parseURLToPickerItem = (url: string): PickerItem => ({
	type: 'external-url',
	value: url,
});
