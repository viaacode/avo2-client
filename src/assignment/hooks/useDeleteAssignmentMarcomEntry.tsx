import { useMutation, type UseMutationResult } from '@tanstack/react-query';

import { AssignmentService } from '../assignment.service';

export const useDeleteAssignmentMarcomEntry = (): UseMutationResult<
	void,
	null,
	{ assignmentId: string; marcomEntryId: string | undefined }
> => {
	return useMutation((info: { assignmentId: string; marcomEntryId: string | undefined }) =>
		AssignmentService.deleteMarcomEntry(info.assignmentId, info.marcomEntryId)
	);
};
