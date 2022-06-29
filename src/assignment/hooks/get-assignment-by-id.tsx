import { QueryResult } from '@apollo/react-common';
import { useQuery } from '@apollo/react-hooks';

import { Avo } from '@viaa/avo2-types';

import { GET_ASSIGNMENT_BY_UUID } from '../assignment.gql';

export function getAssignmentById(
	assignmentId: string
): QueryResult<{ app_assignments_v2: Avo.Assignment.Assignment_v2[] }, { id: string }> {
	// eslint-disable-next-line react-hooks/rules-of-hooks
	return useQuery(GET_ASSIGNMENT_BY_UUID, {
		variables: {
			id: assignmentId,
		},
	});
}
