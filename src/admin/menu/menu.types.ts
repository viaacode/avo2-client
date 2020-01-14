import { IconName } from '@viaa/avo2-components';

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
	external_link: string;
	link_target: '_blank' | '_self';
	group_access: number[];
}

export interface MenuEditFormErrorState {
	description?: string;
	placement?: string;
	icon?: string;
	label?: string;
	external_link?: string;
	link_target?: string;
	group_access?: string;
}
