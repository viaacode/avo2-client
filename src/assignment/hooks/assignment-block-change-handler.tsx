import { cloneDeep } from 'lodash-es';
import { useCallback } from 'react';

import { BaseBlockWithMeta } from '../assignment.types';

export function useAssignmentBlockChangeHandler(
	blocks: BaseBlockWithMeta[],
	setBlocks: (newBlocks: BaseBlockWithMeta[]) => void
): (updatedBlock: BaseBlockWithMeta) => void {
	return useCallback(
		(block: BaseBlockWithMeta) => {
			const updatedBlocks = cloneDeep(blocks);

			const existingBlockIndex = updatedBlocks.findIndex((b) => b.id === block.id);

			updatedBlocks[existingBlockIndex] = block;

			setBlocks(updatedBlocks);
		},
		[blocks, setBlocks]
	);
}
