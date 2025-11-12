import { type Avo } from '@viaa/avo2-types'
import React, { type ReactNode, useMemo } from 'react'

import { switchAssignmentBlockPositions } from '../../assignment/helpers/switch-positions.js'
import { GET_BLOCK_ICON } from '../components/BlockList/BlockIconWrapper/BlockIconWrapper.consts.js'
import { BLOCK_ITEM_LABELS } from '../components/BlockList/BlockList.consts.js'
import {
  BlockListSorter,
  type ListSorterItem,
  type ListSorterProps,
} from '../components/ListSorter/ListSorter.js'
import { getBlockColor } from '../helpers/get-block-color.js'

export function useBlocksList(
  blocks: Avo.Core.BlockItemBase[],
  setBlocks: (newBlocks: Avo.Core.BlockItemBase[]) => void,
  config?: {
    listSorter?: Partial<ListSorterProps<Avo.Core.BlockItemBase>>
    listSorterItem?: Partial<ListSorterItem>
  },
): [ReactNode, (Avo.Core.BlockItemBase & ListSorterItem)[]] {
  const items = useMemo(() => {
    return (blocks || []).map((block) => {
      const mapped: Avo.Core.BlockItemBase & ListSorterItem = {
        ...block,
        ...config?.listSorterItem,
        icon: GET_BLOCK_ICON(block),
        color: getBlockColor(block as Avo.Assignment.Block),
        onPositionChange: (item, delta) => {
          const switched = switchAssignmentBlockPositions(
            blocks,
            item as Avo.Core.BlockItemBase,
            delta,
          )
          setBlocks(switched as Avo.Core.BlockItemBase[])
        },
      }

      return mapped
    })
  }, [blocks, setBlocks, config])

  const ui = useMemo(
    () => (
      <BlockListSorter
        {...config?.listSorter}
        heading={(item) =>
          item &&
          BLOCK_ITEM_LABELS(!!blocks[0].assignment_response_id)[
            item.type as Avo.Core.BlockItemType
          ]
        }
        items={items}
      />
    ),
    [items, config],
  )

  return [ui, items]
}
