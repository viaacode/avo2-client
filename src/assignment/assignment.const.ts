import { DocumentNode } from 'graphql';

import { Avo } from '@viaa/avo2-types';

import { GET_COLLECTION_BY_ID } from '../collection/collection.gql';
import { GET_ITEM_BY_ID } from '../item/item.gql';
import { ROUTE_PARTS } from '../shared/constants';

export const ITEMS_PER_PAGE = 20;

export const CONTENT_LABEL_TO_QUERY: {
	[contentType in Avo.Assignment.ContentLabel]: {
		query: DocumentNode;
		resultPath: string;
		getVariables: (id: string) => any;
	};
} = {
	COLLECTIE: {
		query: GET_COLLECTION_BY_ID,
		resultPath: 'app_collections[0]',
		getVariables: (id: string) => ({ id }),
	},
	ITEM: {
		query: GET_ITEM_BY_ID,
		resultPath: 'app_item_meta[0]',
		getVariables: (id: string) => ({ id }),
	},
	ZOEKOPDRACHT: {
		// TODO implement search query saving and usage
		// query: GET_SEARCH_QUERY_BY_ID,
		// resultPath: 'app_item_meta[0]',
		// getVariables: (id: string) => ({ id }),
	} as any,
};

export const CONTENT_LABEL_TO_ROUTE_PARTS: {
	[contentType in Avo.Assignment.ContentLabel]: string;
} = {
	ITEM: ROUTE_PARTS.item,
	COLLECTIE: ROUTE_PARTS.collections,
	ZOEKOPDRACHT: ROUTE_PARTS.searchQuery,
};

export const CONTENT_LABEL_TO_EVENT_OBJECT_TYPE: {
	[contentType in Avo.Assignment.ContentLabel]: Avo.EventLogging.ObjectType;
} = {
	ITEM: 'avo_item_pid',
	COLLECTIE: 'collections',
	ZOEKOPDRACHT: 'avo_search_query' as any, // TODO add this object type to the database
};
