import { type Avo } from '@viaa/avo2-types';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import { isUserSecondaryElementary } from '../../shared/helpers/is-user';
import { isUserAssignmentOwner } from '../assignment.helper';

export function useEducationLevelModal(
	commonUser: Avo.User.CommonUser | null | undefined,
	assignment: Partial<Avo.Assignment.Assignment> | undefined,
	assignmentLoading = false
): [boolean, Dispatch<SetStateAction<boolean>>] {
	const [isOpen, setOpen] = useState<boolean>(false);

	useEffect(() => {
		if (!assignment || assignmentLoading || assignment.education_level_id) return;
		isUserAssignmentOwner(commonUser, assignment) &&
			isUserSecondaryElementary(commonUser) &&
			setOpen(true);
	}, [assignment, assignmentLoading, commonUser, setOpen]);

	return [isOpen, setOpen];
}
