import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { type AssignmentMarcomEntry } from '../../collection/collection.types';
import { AssignmentService } from '../assignment.service';

export const useInsertAssignmentMarcomEntry = (): UseMutationResult<
	string,
	null,
	AssignmentMarcomEntry
> => {
	return useMutation((marcomEntry: AssignmentMarcomEntry) =>
		AssignmentService.insertMarcomEntry(marcomEntry)
	);
};
