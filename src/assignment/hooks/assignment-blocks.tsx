import { Avo } from '@viaa/avo2-types';
import React, { ReactNode } from 'react';

import { AssignmentBlockType } from '../assignment.types';
import { AssignmentBlockItemDescriptionType } from '../components/AssignmentBlockDescriptionButtons';
import { AssignmentBlockEditItem } from '../components/blocks/AssignmentBlockEditItem';
import { AssignmentBlockEditSearch } from '../components/blocks/AssignmentBlockEditSearch';
import { AssignmentBlockEditText } from '../components/blocks/AssignmentBlockEditText';

export function useEditBlocks(
	setBlock: (updatedBlock: Avo.Core.BlockItemBase) => void,
	AssignmentBlockItemDescriptionTypes?: AssignmentBlockItemDescriptionType[]
): (block: Avo.Core.BlockItemBase) => ReactNode | null {
	return function useEditBlocks(block: Avo.Core.BlockItemBase) {
		switch (block.type) {
			case AssignmentBlockType.TEXT:
				return <AssignmentBlockEditText setBlock={setBlock} block={block} />;

			case AssignmentBlockType.ITEM:
				return (
					<AssignmentBlockEditItem
						setBlock={setBlock}
						block={block}
						AssignmentBlockItemDescriptionTypes={AssignmentBlockItemDescriptionTypes}
					/>
				);

			case AssignmentBlockType.ZOEK:
			case AssignmentBlockType.BOUW:
				return <AssignmentBlockEditSearch setBlock={setBlock} block={block} />;

			default:
				break;
		}
	};
}
