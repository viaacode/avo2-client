import { QueryResult } from '@apollo/react-common';
import { useQuery } from '@apollo/react-hooks';

import { Avo } from '@viaa/avo2-types';

import { GET_ASSIGNMENT_BY_UUID } from '../assignment.gql';

export function useGetAssignmentById(
	assignmentId: string
): QueryResult<{ app_assignments_v2: Avo.Assignment.Assignment_v2[] }, { id: string }> {
	return useQuery(GET_ASSIGNMENT_BY_UUID, {
		variables: {
			id: assignmentId,
		},
	});
}
