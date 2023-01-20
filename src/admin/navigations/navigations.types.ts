export type MenuOverviewTableCols = 'placement' | 'description' | 'actions';

export interface MenuEditParams {
	menu?: string;
	id?: string;
}

export type MenuEditPageType = 'edit' | 'create';

export interface MenuEditFormErrorState {
	description?: string;
	placement?: string;
	icon?: string;
	label?: string;
	content_path?: string;
	content_type?: string;
	link_target?: string;
	user_group_ids?: string;
	tooltip?: string;
}
