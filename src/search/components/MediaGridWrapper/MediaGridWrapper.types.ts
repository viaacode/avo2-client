import { Avo } from '@viaa/avo2-types';

export type ResolvedItemOrCollection = Partial<Avo.Item.Item | Avo.Collection.Collection> & {
	src?: string;
	view_counts_aggregate?: { aggregate?: { sum?: { count?: number } } };
};
