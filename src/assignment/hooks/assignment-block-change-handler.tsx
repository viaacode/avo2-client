import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { useCallback } from 'react';
import { UseFormSetValue } from 'react-hook-form';
import { AssignmentFormState } from '../assignment.types';

export function useAssignmentBlockChangeHandler(
	assignment: AssignmentFormState,
	setAssignment: React.Dispatch<React.SetStateAction<AssignmentFormState>>,
	setValue: UseFormSetValue<AssignmentFormState>
) {
	return useCallback(
		(block: AssignmentBlock, update: Partial<AssignmentBlock>) => {
			const blocks = [
				...assignment.blocks.filter((b) => b.id !== block.id),
				{
					...block,
					...update,
				},
			];

			setAssignment((prev) => ({
				...prev,
				blocks,
			}));

			setValue('blocks', blocks, { shouldDirty: true });
		},
		[assignment, setAssignment, setValue]
	);
}
