import { ContentPickerType, LinkTarget } from '@viaa/avo2-components';

export type PickerItemControls = 'SELECT' | 'TEXT_INPUT';

// TODO: add PROFILE to ContentPickerType
export interface PickerTypeOption<T = ContentPickerType | 'PROFILE'> {
	value: T;
	label: string;
	disabled?: boolean;
	picker: PickerItemControls;
	fetch?: (keyword: string | null, limit: number) => Promise<PickerSelectItem[]>;
	placeholder?: string;
}

export interface PickerSelectItem {
	label: string;
	value: PickerItem;
}

export interface PickerItem {
	label?: string;
	type: ContentPickerType | 'PROFILE';
	value: string;
	target?: LinkTarget;
}
