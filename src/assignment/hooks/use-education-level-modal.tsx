import { type Avo } from '@viaa/avo2-types';
import { type Dispatch, type SetStateAction, useEffect, useState } from 'react';

import { isUserSecondaryElementary } from '../../shared/helpers';

export function useEducationLevelModal(
	commonUser: Avo.User.CommonUser,
	assignment: Partial<Avo.Assignment.Assignment> | undefined
): [boolean, Dispatch<SetStateAction<boolean>>] {
	const state = useState<boolean>(false);
	// eslint-disable-next-line @typescript-eslint/no-unused-vars
	const [_isOpen, setOpen] = state;

	useEffect(() => {
		if (!assignment || assignment.education_level_id) return;
		isUserSecondaryElementary(commonUser) && setOpen(true);
	}, [assignment, commonUser, setOpen]);

	return state;
}
