import { ApolloQueryResult } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { GET_COLLECTION_BY_ID } from '../collection/collection.gql';
import { GET_ITEM_BY_ID } from '../item/item.gql';
import { ROUTE_PARTS } from '../shared/constants';
import { dataService } from '../shared/services/data-service';

export const ASSIGNMENT_PATH = Object.freeze({
	ASSIGNMENT_CREATE: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/${ROUTE_PARTS.create}`,
	ASSIGNMENT_DETAIL: `/${ROUTE_PARTS.assignment}/:id`,
	ASSIGNMENT_EDIT: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/:id/${ROUTE_PARTS.edit}`,
	ASSIGNMENT_RESPONSES: `/${ROUTE_PARTS.workspace}/${ROUTE_PARTS.assignments}/:id/${
		ROUTE_PARTS.responses
	}`,
});

const CONTENT_LABEL_TO_QUERY: {
	[contentType in Avo.Assignment.ContentLabel]: { query: DocumentNode; resultPath: string }
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

export type LoadingState = 'loading' | 'loaded' | 'error';

export const getAssignmentContent = async (
	assignment: Avo.Assignment.Assignment
): Promise<string | Avo.Assignment.Content | null> => {
	try {
		if (assignment.content_id && assignment.content_label) {
			const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query({
				query: CONTENT_LABEL_TO_QUERY[assignment.content_label].query,
				variables: { id: assignment.content_id },
			});

			const newAssignmentContent = get(
				response,
				`data.${
					CONTENT_LABEL_TO_QUERY[assignment.content_label as Avo.Assignment.ContentLabel].resultPath
				}`
			);

			if (!newAssignmentContent) {
				return 'De opdracht werdt niet gevonden';
			}

			return newAssignmentContent;
		}

		return null;
	} catch (err) {
		console.error(err);
		return 'Het ophalen van de opdracht inhoud is mislukt';
	}
};
