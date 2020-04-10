import { LinkTarget } from '@viaa/avo2-components';

export type ContentPickerType =
	| 'CONTENT_PAGE'
	| 'COLLECTION'
	| 'ITEM'
	| 'DROPDOWN'
	| 'INTERNAL_LINK'
	| 'EXTERNAL_LINK'
	| 'BUNDLE'
	| 'SEARCH_QUERY'
	| 'PROJECTS'; // TODO replace with type from typings repo after update to 2.16.0

export type PickerItemControls = 'SELECT' | 'TEXT_INPUT';

export interface PickerTypeOption<T = ContentPickerType> {
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
	type: ContentPickerType;
	value: string;
	target?: LinkTarget;
}
