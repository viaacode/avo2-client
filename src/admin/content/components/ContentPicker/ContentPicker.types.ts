import { OptionsType } from 'react-select/src/types';

import { ContentType } from '../../content.types';

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
	type: ContentType;
	value: string;
}
