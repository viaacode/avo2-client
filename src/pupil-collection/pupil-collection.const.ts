import { type Avo } from '@viaa/avo2-types';

import { type PupilCollectionOverviewTableColumns } from './pupil-collection.types';

export const ITEMS_PER_PAGE = 20;

export const PUPIL_COLLECTIONS_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<{
	[columnId in PupilCollectionOverviewTableColumns]: (order: Avo.Search.OrderDirection) => any;
}> = {
	title: (order: Avo.Search.OrderDirection) => ({
		collection_title: order,
	}),
	pupil: (order: Avo.Search.OrderDirection) => ({
		owner: {
			full_name: order,
		},
	}),
	assignmentTitle: (order: Avo.Search.OrderDirection) => ({
		assignment: {
			title: order,
		},
	}),
	teacher: (order: Avo.Search.OrderDirection) => ({
		assignment: {
			owner: {
				full_name: order,
			},
		},
	}),
	deadline_at: (order: Avo.Search.OrderDirection) => ({
		assignment: {
			deadline_at: order,
		},
	}),
	status: (order: Avo.Search.OrderDirection) => ({
		assignment: {
			deadline_at: order,
		},
	}),
};
