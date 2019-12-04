export enum PageType {
	Create = 'create',
	Edit = 'edit',
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

export type ContentParams = { id: string };

export interface ContentEditFormState {
	title: string;
	description: string;
	contentType: string;
	publishAt: string;
	depublishAt: string;
}

export type ContentTypesResponse = { value: string };
