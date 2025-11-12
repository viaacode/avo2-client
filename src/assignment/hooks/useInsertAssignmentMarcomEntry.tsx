import {useMutation} from '@tanstack/react-query';

import {type AssignmentMarcomEntry} from '../../collection/collection.types.js';
import {AssignmentService} from '../assignment.service.js';
import {UseMutationResult} from "../../shared/types/react-query.ts";

export const useInsertAssignmentMarcomEntry = (): UseMutationResult<
	string,
	null,
	AssignmentMarcomEntry
> => {
	return useMutation((marcomEntry: AssignmentMarcomEntry) =>
		AssignmentService.insertMarcomEntry(marcomEntry)
	);
};
