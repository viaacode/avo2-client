import { ContentPickerType } from '../../content.types';

export interface PickerTypeOption<T = string> {
	value: T;
	label: string;
	disabled?: boolean;
	fetch: (limit: number) => Promise<PickerSelectItemGroup>;
}

export interface PickerSelectItemGroup {
	label: string;
	options: PickerSelectItem[];
}

export interface PickerSelectItem {
	label: string;
	value: PickerItem;
}

export interface PickerItem {
	type: ContentPickerType;
	value: string;
}
