import { AvoCoreBlockItemBase, AvoItemItem } from '@viaa/avo2-types';

export const isItemWithMeta = (block: AvoCoreBlockItemBase): boolean => {
  if (block.type === 'ITEM') {
    if (block.item_meta) {
      return (block.item_meta as AvoItemItem).depublish_reason === undefined;
    } else {
      return false;
    }
  }

  return true;
};
