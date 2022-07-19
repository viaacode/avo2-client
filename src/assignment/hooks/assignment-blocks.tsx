import { Avo } from '@viaa/avo2-types';
import React, { ReactNode } from 'react';

import { AssignmentBlockType } from '../assignment.types';
import { AssignmentBlockEditItem } from '../components/blocks/AssignmentBlockEditItem';
import { AssignmentBlockEditSearch } from '../components/blocks/AssignmentBlockEditSearch';
import { AssignmentBlockEditText } from '../components/blocks/AssignmentBlockEditText';

import { AssignmentBlockItemDescriptionType } from './assignment-block-description-buttons';

export function useEditBlocks(
	setBlock: (block: Avo.Core.BlockItemBase, update: Partial<Avo.Core.BlockItemBase>) => void,
	buildSearchLink?: (props: Partial<Avo.Search.Filters>) => ReactNode | string,
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
						buildSearchLink={buildSearchLink}
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
