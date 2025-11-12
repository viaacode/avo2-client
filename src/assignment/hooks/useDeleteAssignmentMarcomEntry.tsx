import {useMutation} from '@tanstack/react-query';

import {AssignmentService} from '../assignment.service.js';
import {UseMutationResult} from "../../shared/types/react-query.ts";

export const useDeleteAssignmentMarcomEntry = (): UseMutationResult<
	void,
	null,
	{ assignmentId: string; marcomEntryId: string | undefined }
> => {
	return useMutation((info: { assignmentId: string; marcomEntryId: string | undefined }) =>
		AssignmentService.deleteMarcomEntry(info.assignmentId, info.marcomEntryId)
	);
};
