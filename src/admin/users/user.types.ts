import { IconName } from '@viaa/avo2-components';

import { ContentPickerType } from '../shared/types';

export type UserOverviewTableCols = 'name' | 'actions';

export interface UserEditParams {
	user?: string;
	id?: string;
}

export interface UserEditFormState {
	description?: string;
	placement?: string;
	icon: IconName | '';
	label: string;
	content_path: string | null;
	content_type: ContentPickerType | null;
	link_target: '_blank' | '_self';
	user_group_ids: number[];
}

export interface UserEditFormErrorState {
	description?: string;
	placement?: string;
	icon?: string;
	label?: string;
	content_path?: string;
	content_type?: string;
	link_target?: string;
	user_group_ids?: string;
}
