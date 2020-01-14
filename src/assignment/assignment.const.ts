import { DocumentNode } from 'graphql';

import { Avo } from '@viaa/avo2-types';

import { GET_COLLECTION_BY_ID } from '../collection/collection.gql';
import { GET_ITEM_BY_ID } from '../item/item.gql';
import { ROUTE_PARTS } from '../shared/constants';

export const ASSIGNMENT_PATH = Object.freeze({
	ASSIGNMENT_CREATE: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/${ROUTE_PARTS.create}`,
	ASSIGNMENT_DETAIL: `/${ROUTE_PARTS.assignments}/:id`,
	ASSIGNMENT_EDIT: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/:id/${ROUTE_PARTS.edit}`,
	ASSIGNMENT_RESPONSES: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/:id/${ROUTE_PARTS.responses}`,
});

export const CONTENT_LABEL_TO_QUERY: {
	[contentType in Avo.Assignment.ContentLabel]: { query: DocumentNode; resultPath: string };
} = {
	COLLECTIE: {
		query: GET_COLLECTION_BY_ID,
		resultPath: 'app_collections[0]',
	},
	ITEM: {
		query: GET_ITEM_BY_ID,
		resultPath: 'app_item_meta[0]',
	},
	ZOEKOPDRACHT: {
		// TODO implement search query saving and usage
		// query: GET_SEARCH_QUERY_BY_ID,
		// resultPath: 'app_item_meta[0]',
	} as any,
};
