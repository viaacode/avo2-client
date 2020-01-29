import { IconName } from '@viaa/avo2-components';

import { ContentPickerType } from '../content/content.types';

export type MenuOverviewTableCols = 'placement' | 'description' | 'actions';

export interface MenuEditParams {
	menu?: string;
	id?: string;
}

export type MenuEditPageType = 'edit' | 'create';

export interface MenuEditFormState {
	description?: string;
	placement?: string;
	icon: IconName | '';
	label: string;
	content_path: string;
	content_type: ContentPickerType;
	link_target: '_blank' | '_self';
	user_group_ids: number[];
}

export interface MenuEditFormErrorState {
	description?: string;
	placement?: string;
	icon?: string;
	label?: string;
	content_path?: string;
	content_type?: string;
	link_target?: string;
	user_group_ids?: string;
}

// TODO: Remove with next typings release 0.2.8.
export interface MenuSchema {
	id: number;
	label: string;
	icon_name: string;
	description: string | null;
	// tslint:disable-next-line: prefer-array-literal
	user_group_ids: Array<number | string> | { [key: string]: string } | null;
	content_type: ContentPickerType | null;
	content_path: string | null;
	link_target: '_blank' | '_self' | null;
	position: number;
	placement: string;
	created_at: string;
	updated_at: string;
}
