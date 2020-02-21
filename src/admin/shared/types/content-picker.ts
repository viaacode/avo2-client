export type ContentPickerType =
	| 'CONTENT_PAGE'
	| 'COLLECTION'
	| 'ITEM'
	| 'DROPDOWN'
	| 'INTERNAL_LINK'
	| 'EXTERNAL_LINK'
	| 'BUNDLE';

export type PickerItemControls = 'SELECT' | 'TEXT_INPUT';

export interface PickerTypeOption<T = ContentPickerType> {
	value: T;
	label: string;
	disabled?: boolean;
	picker: PickerItemControls;
	fetch?: (keyword: string | null, limit: number) => Promise<PickerSelectItem[]>;
}

export interface PickerSelectItem {
	label: string;
	value: PickerItem;
}

export interface PickerItem {
	type: ContentPickerType;
	value: string;
}

export interface PickerSelectItemGroup {
	label: string;
	options: PickerSelectItem[];
}
