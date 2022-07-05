import { AssignmentBlock } from '@viaa/avo2-types/types/assignment';
import { cloneDeep } from 'lodash-es';
import { useCallback } from 'react';

export function useAssignmentBlockChangeHandler(
	blocks: AssignmentBlock[],
	setBlocks: (newBlocks: AssignmentBlock[]) => void
): (existingBlock: AssignmentBlock, updatedBlock: Partial<AssignmentBlock>) => void {
	return useCallback(
		(existingBlock: AssignmentBlock, updatedBlock: Partial<AssignmentBlock>) => {
			const updatedBlocks = cloneDeep(blocks);

			const existingBlockIndex = updatedBlocks.findIndex(
				(block) => block.id === existingBlock.id
			);

			updatedBlocks[existingBlockIndex] = {
				...existingBlock,
				...updatedBlock,
			};

			setBlocks(updatedBlocks);
		},
		[blocks, setBlocks]
	);
}
