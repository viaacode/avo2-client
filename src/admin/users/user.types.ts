import { IconName } from '@viaa/avo2-components';

import { ContentPickerType } from '../shared/types';

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
	content_path: string | null;
	content_type: ContentPickerType | null;
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
