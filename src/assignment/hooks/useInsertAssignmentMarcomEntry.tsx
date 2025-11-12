import { useMutation } from '@tanstack/react-query'

import { type AssignmentMarcomEntry } from '../../collection/collection.types.js'
import { UseMutationResult } from '../../shared/types/react-query.ts'
import { AssignmentService } from '../assignment.service.js'

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
