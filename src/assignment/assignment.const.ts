import { DocumentNode } from 'graphql';

import { Avo } from '@viaa/avo2-types';
import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';

import { GET_ITEM_BY_EXTERNAL_ID } from '../admin/items/items.gql';
import { ROUTE_PARTS } from '../shared/constants';

import { AssignmentOverviewTableColumns } from './assignment.types';

export const ITEMS_PER_PAGE = 20;

export const CONTENT_LABEL_TO_QUERY: {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	[contentType in AssignmentContentLabel]: {
		/* eslint-enable @typescript-eslint/no-unused-vars */
		query: DocumentNode;
		resultPath: string;
		getVariables: (id: string) => any;
	};
} = {
	ITEM: {
		query: GET_ITEM_BY_EXTERNAL_ID,
		resultPath: 'app_item_meta[0]',
		getVariables: (id: string) => ({ externalId: id }),
	},
	COLLECTIE: {} as any,
	ZOEKOPDRACHT: {
		// TODO implement search query saving and usage
		// query: GET_SEARCH_QUERY_BY_ID,
		// resultPath: 'app_item_meta[0]',
		// getVariables: (id: string) => ({ id }),
	} as any,
};

export const CONTENT_LABEL_TO_ROUTE_PARTS: {
	/* eslint-disable @typescript-eslint/no-unused-vars */
	[contentType in Avo.Assignment.ContentLabel]: string /* eslint-enable @typescript-eslint/no-unused-vars */;
} = {
	ITEM: ROUTE_PARTS.item,
	COLLECTIE: ROUTE_PARTS.collections,
	ZOEKOPDRACHT: ROUTE_PARTS.searchQuery,
};

export const TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT: Partial<
	{
		/* eslint-disable @typescript-eslint/no-unused-vars */
		[columnId in AssignmentOverviewTableColumns]: (
			order: Avo.Search.OrderDirection
		) => any /* eslint-enable @typescript-eslint/no-unused-vars */;
	}
> = {
	title: (order: Avo.Search.OrderDirection) => ({
		assignment: { title: order },
	}),
	class_room: (order: Avo.Search.OrderDirection) => ({
		assignment: { class_room: order },
	}),
	deadline_at: (order: Avo.Search.OrderDirection) => ({
		assignment: { deadline_at: order },
	}),
	created_at: (order: Avo.Search.OrderDirection) => ({
		assignment: { created_at: order },
	}),
	author: (order: Avo.Search.OrderDirection) => ({
		assignment: { profile: { usersByuserId: { last_name: order } } },
	}),
};
