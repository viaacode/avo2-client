import { type Avo } from '@viaa/avo2-types'

export const isItemWithMeta = (block: Avo.Core.BlockItemBase): boolean => {
  if (block.type === 'ITEM') {
    if (block.item_meta) {
      return (block.item_meta as Avo.Item.Item).depublish_reason === undefined
    } else {
      return false
    }
  }

  return true
}
