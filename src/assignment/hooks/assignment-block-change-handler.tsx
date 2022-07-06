import { Avo } from '@viaa/avo2-types';
import { cloneDeep } from 'lodash-es';
import { useCallback } from 'react';

export function useAssignmentBlockChangeHandler(
	blocks: Avo.Core.BlockItemBase[],
	setBlocks: (newBlocks: Avo.Core.BlockItemBase[]) => void
): (existingBlock: Avo.Core.BlockItemBase, updatedBlock: Partial<Avo.Core.BlockItemBase>) => void {
	return useCallback(
		(existingBlock: Avo.Core.BlockItemBase, updatedBlock: Partial<Avo.Core.BlockItemBase>) => {
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
