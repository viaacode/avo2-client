import React, { ReactNode } from 'react';

import { FilterState } from '../../search/search.types';
import {
	AssignmentBlockType,
	BaseBlockWithMeta,
	EditableAssignmentBlock,
} from '../assignment.types';
import { AssignmentBlockItemDescriptionType } from '../components/AssignmentBlockDescriptionButtons';
import { AssignmentBlockEditItem } from '../components/blocks/AssignmentBlockEditItem';
import { AssignmentBlockEditSearch } from '../components/blocks/AssignmentBlockEditSearch';
import { AssignmentBlockEditText } from '../components/blocks/AssignmentBlockEditText';

export function useEditBlocks(
	setBlock: (updatedBlock: BaseBlockWithMeta) => void,
	buildSearchLink?: (props: Partial<FilterState>) => ReactNode | string,
	AssignmentBlockItemDescriptionTypes?: AssignmentBlockItemDescriptionType[]
): (block: BaseBlockWithMeta) => ReactNode | null {
	return function useEditBlocks(block: BaseBlockWithMeta) {
		switch (block.type) {
			case AssignmentBlockType.TEXT:
				return (
					<AssignmentBlockEditText
						setBlock={setBlock}
						block={block as EditableAssignmentBlock}
					/>
				);

			case AssignmentBlockType.ITEM:
				return (
					<AssignmentBlockEditItem
						setBlock={setBlock}
						block={block as EditableAssignmentBlock}
						AssignmentBlockItemDescriptionTypes={AssignmentBlockItemDescriptionTypes}
						buildSearchLink={buildSearchLink}
					/>
				);

			case AssignmentBlockType.ZOEK:
			case AssignmentBlockType.BOUW:
				return (
					<AssignmentBlockEditSearch
						setBlock={setBlock}
						block={block as EditableAssignmentBlock}
					/>
				);

			default:
				break;
		}
	};
}
