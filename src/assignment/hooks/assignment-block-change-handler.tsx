import { AvoCoreBlockItemBase } from '@viaa/avo2-types';
import { cloneDeep } from 'es-toolkit';
import { useCallback } from 'react';

export function useAssignmentBlockChangeHandler(
  blocks: AvoCoreBlockItemBase[],
  setBlocks: (newBlocks: AvoCoreBlockItemBase[]) => void,
): (updatedBlock: AvoCoreBlockItemBase) => void {
  return useCallback(
    (block: AvoCoreBlockItemBase) => {
      const updatedBlocks = cloneDeep(blocks);

      const existingBlockIndex = updatedBlocks.findIndex(
        (b) => b.id === block.id,
      );

      updatedBlocks[existingBlockIndex] = block;

      setBlocks(updatedBlocks);
    },
    [blocks, setBlocks],
  );
}
