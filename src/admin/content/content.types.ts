import { Avo } from '@viaa/avo2-types';

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

// TODO: these should go to the avo2-typings repo
export interface ContentSchema {
	id: number;
	title: string;
	description?: string;
	is_published?: boolean;
	is_public?: boolean;
	publish_at: string;
	depublish_at: string;
	created_at: string;
	updated_at: string;
	is_protected: boolean;
	content_type: string;
	user: Avo.User.Profile;
}
