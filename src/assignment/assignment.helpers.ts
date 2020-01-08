import { ApolloQueryResult } from 'apollo-client';
import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { dataService } from '../shared/services/data-service';
import { CONTENT_LABEL_TO_QUERY } from './assignment.const';

export const getAssignmentContent = async (
	assignment: Avo.Assignment.Assignment
): Promise<Avo.Assignment.Content | null> => {
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
			throw 'NOT_FOUND';
		}

		return newAssignmentContent;
	}

	return null;
};
