import { Avo } from '@viaa/avo2-types'
import React, { type ReactNode } from 'react'

import { type FilterState } from '../../search/search.types.js'
import { type EditableAssignmentBlock } from '../assignment.types.js'
import { type AssignmentBlockItemDescriptionType } from '../components/AssignmentBlockDescriptionButtons.js'
import { AssignmentBlockEditItem } from '../components/blocks/AssignmentBlockEditItem.js'
import { AssignmentBlockEditSearch } from '../components/blocks/AssignmentBlockEditSearch.js'
import { AssignmentBlockEditText } from '../components/blocks/AssignmentBlockEditText.js'

export function useEditBlocks(
  setBlock: (updatedBlock: Avo.Core.BlockItemBase) => void,
  buildSearchLink?: (props: Partial<FilterState>) => ReactNode | string,
  AssignmentBlockItemDescriptionTypes?: AssignmentBlockItemDescriptionType[],
  onFocus?: () => void,
): (block: Avo.Core.BlockItemBase) => ReactNode | null {
  return function useEditBlocks(block: Avo.Core.BlockItemBase) {
    switch (block.type) {
      case Avo.Core.BlockItemType.TEXT:
        return (
          <AssignmentBlockEditText
            setBlock={setBlock}
            block={block as EditableAssignmentBlock}
            onFocus={onFocus}
          />
        )

      case Avo.Core.BlockItemType.ITEM:
        return (
          <AssignmentBlockEditItem
            setBlock={setBlock}
            block={block as EditableAssignmentBlock}
            AssignmentBlockItemDescriptionTypes={
              AssignmentBlockItemDescriptionTypes
            }
            buildSearchLink={buildSearchLink}
          />
        )

      case Avo.Core.BlockItemType.ZOEK:
      case Avo.Core.BlockItemType.BOUW:
        return (
          <AssignmentBlockEditSearch
            setBlock={setBlock}
            block={block as EditableAssignmentBlock}
          />
        )

      default:
        break
    }
  }
}
