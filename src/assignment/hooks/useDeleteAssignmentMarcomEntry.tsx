import { useMutation } from '@tanstack/react-query'
import { UseMutationResult } from '../../shared/types/react-query.ts'
import { AssignmentService } from '../assignment.service';

export const useDeleteAssignmentMarcomEntry = (): UseMutationResult<
  void,
  null,
  { assignmentId: string; marcomEntryId: string | undefined }
> => {
  return useMutation({
    mutationFn: (info: {
      assignmentId: string
      marcomEntryId: string | undefined
    }) =>
      AssignmentService.deleteMarcomEntry(
        info.assignmentId,
        info.marcomEntryId,
      ),
  })
}
