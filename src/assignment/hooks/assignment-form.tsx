import React, { useState } from 'react';
import { useTranslation } from 'react-i18next';

import { ASSIGNMENT_FORM_DEFAULT } from '../assignment.const';
import { AssignmentFormState } from '../assignment.types';

export type useAssignmentFormState = [
	AssignmentFormState,
	React.Dispatch<React.SetStateAction<AssignmentFormState>>
];

export function useAssignmentForm(
	initial?: AssignmentFormState,
	state?: useAssignmentFormState
): [
	AssignmentFormState,
	React.Dispatch<React.SetStateAction<AssignmentFormState>>,
	AssignmentFormState
] {
	const [t] = useTranslation();

	// Data
	const [defaultValues] = useState<AssignmentFormState>(initial || ASSIGNMENT_FORM_DEFAULT(t));
	const [assignment, setAssignment] = useState<AssignmentFormState>(defaultValues);

	// Return the existing stateful value and dispatcher if present
	if (state) {
		return [...state, defaultValues];
	}
	return [assignment, setAssignment, defaultValues];
}
