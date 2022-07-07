import { Avo } from '@viaa/avo2-types';
import React, { ReactNode } from 'react';

import { AssignmentBlockType } from '../assignment.types';
import { AssignmentBlockItem } from '../components/blocks/AssignmentBlockItem';
import { AssignmentBlockSearch } from '../components/blocks/AssignmentBlockSearch';
import { AssignmentBlockText } from '../components/blocks/AssignmentBlockText';

export function useBlocks(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void
): (block: Avo.Core.BlockItemBase) => ReactNode | null {
	return function useBlocks(block: Avo.Core.BlockItemBase) {
		switch (block.type) {
			case AssignmentBlockType.TEXT:
				return <AssignmentBlockText setBlock={setBlock} block={block} />;

			case AssignmentBlockType.ITEM:
				return <AssignmentBlockItem setBlock={setBlock} block={block} />;

			case AssignmentBlockType.ZOEK:
			case AssignmentBlockType.BOUW:
				return <AssignmentBlockSearch setBlock={setBlock} block={block} />;

			default:
				break;
		}
	};
}
