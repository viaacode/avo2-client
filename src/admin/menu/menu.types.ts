import { IconName } from '@viaa/avo2-components';

export type MenuOverviewTableCols = 'placement' | 'description' | 'actions';

export interface MenuEditParams {
	menu: string;
	id?: string;
}

export type MenuEditPageType = 'edit' | 'create';

export interface MenuEditForm {
	icon: IconName | '';
	label: string;
	link: string;
}
