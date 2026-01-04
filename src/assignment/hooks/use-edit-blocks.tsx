import { AvoCoreBlockItemBase, AvoCoreBlockItemType } from '@viaa/avo2-types';
import { type ReactNode } from 'react';
import { type FilterState } from '../../search/search.types';
import { type EditableAssignmentBlock } from '../assignment.types';
import { type AssignmentBlockItemDescriptionType } from '../components/AssignmentBlockDescriptionButtons';
import { AssignmentBlockEditItem } from '../components/blocks/AssignmentBlockEditItem';
import { AssignmentBlockEditSearch } from '../components/blocks/AssignmentBlockEditSearch';
import { AssignmentBlockEditText } from '../components/blocks/AssignmentBlockEditText';

export function useEditBlocks(
  setBlock: (updatedBlock: AvoCoreBlockItemBase) => void,
  buildSearchLink?: (props: Partial<FilterState>) => ReactNode | string,
  AssignmentBlockItemDescriptionTypes?: AssignmentBlockItemDescriptionType[],
  onFocus?: () => void,
): (block: AvoCoreBlockItemBase) => ReactNode | null {
  return function useEditBlocks(block: AvoCoreBlockItemBase) {
    switch (block.type) {
      case AvoCoreBlockItemType.TEXT:
        return (
          <AssignmentBlockEditText
            setBlock={setBlock}
            block={block as EditableAssignmentBlock}
            onFocus={onFocus}
          />
        );

      case AvoCoreBlockItemType.ITEM:
        return (
          <AssignmentBlockEditItem
            setBlock={setBlock}
            block={block as EditableAssignmentBlock}
            AssignmentBlockItemDescriptionTypes={
              AssignmentBlockItemDescriptionTypes
            }
            buildSearchLink={buildSearchLink}
          />
        );

      case AvoCoreBlockItemType.ZOEK:
      case AvoCoreBlockItemType.BOUW:
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
