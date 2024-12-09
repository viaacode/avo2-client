import { type Avo } from '@viaa/avo2-types';

export type ResolvedItemOrCollectionOrAssignment = Partial<
	Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment
> & {
	src?: string;
	type: { label: 'audio' | 'video' | 'collectie' | 'bundel' | 'opdracht' };
	view_count: number;
	item_count?: number;
	copyright_organisation: Avo.Organization.Organization | null;
	copyright_image: string | null;
};
