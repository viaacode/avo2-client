import { type DbContentPage } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';

export type ResolvedItemOrCollectionOrAssignmentOrContentPage = Partial<
	Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment | DbContentPage
> & {
	src?: string;
	type: { label: 'audio' | 'video' | 'collectie' | 'bundel' | 'opdracht' };
	view_count: number;
	item_count?: number;
	media_item_label: string | null;
	copyright_organisation: Avo.Organization.Organization | null;
	copyright_image: string | null;
};
