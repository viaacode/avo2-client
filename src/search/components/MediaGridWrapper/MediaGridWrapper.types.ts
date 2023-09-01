import type { Avo } from '@viaa/avo2-types';

export type ResolvedItemOrCollectionOrAssignment = Partial<
	Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment
> & {
	src?: string;
	view_counts_aggregate?: { aggregate?: { sum?: { count?: number } } };
};
