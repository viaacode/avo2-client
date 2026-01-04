import { AvoAssignmentAssignment, AvoUserCommonUser } from '@viaa/avo2-types';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';
import { isUserSecondaryElementary } from '../../shared/helpers/is-user';
import { isUserAssignmentOwner } from '../assignment.helper';

export function useEducationLevelModal(
  commonUser: AvoUserCommonUser | null | undefined,
  assignment: Partial<AvoAssignmentAssignment> | undefined,
  assignmentLoading = false,
): [boolean, Dispatch<SetStateAction<boolean>>] {
  const [isOpen, setOpen] = useState<boolean>(false);

  useEffect(() => {
    if (!assignment || assignmentLoading || assignment.education_level_id)
      return;
    isUserAssignmentOwner(commonUser, assignment) &&
      isUserSecondaryElementary(commonUser) &&
      setOpen(true);
  }, [assignment, assignmentLoading, commonUser, setOpen]);

  return [isOpen, setOpen];
}
