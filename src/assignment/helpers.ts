import { ApolloQueryResult } from 'apollo-client';
import { DocumentNode } from 'graphql';
import { get } from 'lodash-es';
import { GET_COLLECTION_BY_ID } from '../collection/graphql';
import { GET_ITEM_BY_ID } from '../item/item.gql';
import { dataService } from '../shared/services/data-service';
import { Assignment, AssignmentContent, AssignmentContentLabel } from './types';

const CONTENT_LABEL_TO_QUERY: {
	[contentType in AssignmentContentLabel]: { query: DocumentNode; resultPath: string }
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
	assignment: Assignment
): Promise<string | AssignmentContent | null> => {
	try {
		if (assignment.content_id && assignment.content_label) {
			const response: ApolloQueryResult<AssignmentContent> = await dataService.query({
				query: CONTENT_LABEL_TO_QUERY[assignment.content_label].query,
				variables: { id: assignment.content_id },
			});

			const newAssignmentContent = get(
				response,
				`data.${
					CONTENT_LABEL_TO_QUERY[assignment.content_label as AssignmentContentLabel].resultPath
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
