import { useMutation } from '@tanstack/react-query'

import { type AssignmentMarcomEntry } from '../../collection/collection.types';
import { UseMutationResult } from '../../shared/types/react-query.ts'
import { AssignmentService } from '../assignment.service';

export const useInsertAssignmentMarcomEntry = (): UseMutationResult<
  string,
  null,
  AssignmentMarcomEntry
> => {
  return useMutation({
    mutationFn: (marcomEntry: AssignmentMarcomEntry) =>
      AssignmentService.insertMarcomEntry(marcomEntry),
  })
}
