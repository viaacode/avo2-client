import { Avo } from '@viaa/avo2-types';

import { ROUTE_PARTS } from '../../shared/constants';

import { CollectionsOrBundlesOverviewTableCols } from './collections-or-bundles.types';

export const COLLECTIONS_OR_BUNDLES_PATH = {
	COLLECTIONS_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.collections}`,
	BUNDLES_OVERVIEW: `/${ROUTE_PARTS.admin}/${ROUTE_PARTS.bundles}`,
};

export const ITEMS_PER_PAGE = 10;

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		[columnId in CollectionsOrBundlesOverviewTableCols]: (
			order: Avo.Search.OrderDirection
		) => any;
	}
> = {
	author: (order: Avo.Search.OrderDirection) => ({
		profile: { usersByuserId: { last_name: order } },
	}),
	author_user_group: (order: Avo.Search.OrderDirection) => ({
		profile: { profile_user_group: { group: { label: order } } },
	}),
	last_updated_by_profile: (order: Avo.Search.OrderDirection) => ({
		updated_by: { usersByuserId: { last_name: order } },
	}),
	views: (order: Avo.Search.OrderDirection) => ({
		view_counts_aggregate: {
			sum: {
				count: order,
			},
		},
	}),
	bookmarks: (order: Avo.Search.OrderDirection) => ({
		counts: {
			bookmarks: order,
		},
	}),
	copies: (order: Avo.Search.OrderDirection) => ({
		relations_aggregate: {
			count: order,
		},
	}),
	in_bundle: (order: Avo.Search.OrderDirection) => ({
		counts: {
			in_collection: order,
		},
	}),
	in_assignment: (order: Avo.Search.OrderDirection) => ({
		counts: {
			in_assignment: order,
		},
	}),
};
