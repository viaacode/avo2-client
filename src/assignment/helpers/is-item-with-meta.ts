import { AvoCoreBlockItemBase, AvoItemItem } from '@viaa/avo2-types';
import { isNil } from 'es-toolkit';

export const isItemWithMeta = (block: AvoCoreBlockItemBase): boolean => {
  if (block.type === 'ITEM') {
    if (block.item_meta) {
      return isNil((block.item_meta as AvoItemItem).depublish_reason);
    } else {
      return false;
    }
  }

  return true;
};
