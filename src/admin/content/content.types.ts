import { ContentBlockConfig } from '../content-block/content-block.types';

export enum PageType {
	Create = 'create',
	Edit = 'edit',
}

export enum ContentPageType {
	FAQ = 'FAQ',
	News = 'NIEUWS',
	Page = 'PAGINA',
	Project = 'PROJECT',
}

export type ContentPickerType = 'collection' | 'item' | 'bundle' | 'content' | 'static';
export type ContentWidth = 'medium' | 'large' | 'default';

export interface ContentTypesResponse {
	value: string;
}

export type ContentOverviewTableCols =
	| 'title'
	| 'content_type'
	| 'author'
	| 'role'
	| 'publish_at'
	| 'depublish_at'
	| 'created_at'
	| 'updated_at'
	| 'actions';

export type ContentDetailParams = { id: string };

export interface ContentEditFormState {
	title: string;
	description: string;
	isProtected: boolean;
	path: string;
	contentType: string;
	contentWidth: ContentWidth;
	publishAt: string;
	depublishAt: string;
}

export interface ContentEditState {
	readonly contentBlockConfigs: ContentBlockConfig[];
}

export type ContentEditFormErrors = Partial<{ [key in keyof ContentEditFormState]: string }>;

export enum ContentEditActionType {
	ADD_CONTENT_BLOCK_CONFIG = '@@admin-content-edit/ADD_CONTENT_BLOCK_CONFIG',
	REMOVE_CONTENT_BLOCK_CONFIG = '@@admin-content-edit/REMOVE_CONTENT_BLOCK_CONFIG',
	REORDER_CONTENT_BLOCK_CONFIG = '@@admin-content-edit/REORDER_CONTENT_BLOCK_CONFIG',
	SET_CONTENT_BLOCK_CONFIGS = '@@admin-content-edit/SET_CONTENT_BLOCK_CONFIGS',
	ADD_COMPONENTS_STATE = '@@admin-content-edit/ADD_COMPONENTS_STATE',
	SET_COMPONENTS_STATE = '@@admin-content-edit/SET_COMPONENTS_STATE',
	REMOVE_COMPONENTS_STATE = '@@admin-content-edit/REMOVE_COMPONENTS_STATE',
	SET_BLOCK_STATE = '@@admin-content-edit/SET_BLOCK_STATE',
}

export interface ContentEditAction {
	type: ContentEditActionType;
	payload: any;
}
