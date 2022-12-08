import { Dispatch, SetStateAction, useState } from 'react';

import { ASSIGNMENT_FORM_DEFAULT } from '../assignment.const';
import { AssignmentFormState } from '../assignment.types';

export type useAssignmentFormState = [
	AssignmentFormState,
	Dispatch<SetStateAction<Partial<AssignmentFormState> | undefined>>
];

export function useAssignmentForm(
	initial?: AssignmentFormState,
	state?: useAssignmentFormState
): [
	Partial<AssignmentFormState> | undefined,
	Dispatch<SetStateAction<Partial<AssignmentFormState> | undefined>>,
	Partial<AssignmentFormState> | undefined
] {
	// Data
	const [defaultValues] = useState<Partial<AssignmentFormState> | undefined>(
		initial || ASSIGNMENT_FORM_DEFAULT()
	);
	const [assignment, setAssignment] = useState<Partial<AssignmentFormState> | undefined>(
		defaultValues
	);

	// Return the existing stateful value and dispatcher if present
	if (state) {
		return [state[0], state[1], defaultValues];
	}
	return [assignment, setAssignment, defaultValues];
}
