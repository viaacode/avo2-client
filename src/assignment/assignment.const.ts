import { DocumentNode } from 'graphql';

import { Avo } from '@viaa/avo2-types';

import { GET_COLLECTION_BY_ID } from '../collection/collection.gql';
import { GET_ITEM_BY_ID } from '../item/item.gql';

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
