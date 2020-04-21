import { ApolloQueryResult } from 'apollo-client';
import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../shared/helpers';
import { dataService } from '../shared/services';
import { CONTENT_LABEL_TO_QUERY } from './assignment.const';

export const getAssignmentContent = async (
	assignment: Avo.Assignment.Assignment
): Promise<Avo.Assignment.Content | null> => {
	if (assignment.content_id && assignment.content_label) {
		const queryInfo = CONTENT_LABEL_TO_QUERY[assignment.content_label];
		const response: ApolloQueryResult<Avo.Assignment.Content> = await dataService.query({
			query: queryInfo.query,
			variables: queryInfo.getVariables(assignment.content_id),
		});

		const newAssignmentContent = get(response, `data.${queryInfo.resultPath}`);

		if (!newAssignmentContent) {
			throw new CustomError('NOT_FOUND');
		}

		return newAssignmentContent;
	}

	return null;
};
