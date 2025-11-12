import { type Avo } from '@viaa/avo2-types';
import { cloneDeep } from 'es-toolkit';
import { useCallback } from 'react';

export function useAssignmentBlockChangeHandler(
	blocks: Avo.Core.BlockItemBase[],
	setBlocks: (newBlocks: Avo.Core.BlockItemBase[]) => void
): (updatedBlock: Avo.Core.BlockItemBase) => void {
	return useCallback(
		(block: Avo.Core.BlockItemBase) => {
			const updatedBlocks = cloneDeep(blocks);

			const existingBlockIndex = updatedBlocks.findIndex((b) => b.id === block.id);

			updatedBlocks[existingBlockIndex] = block;

			setBlocks(updatedBlocks);
		},
		[blocks, setBlocks]
	);
}
