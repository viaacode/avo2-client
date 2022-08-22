import { BlockItemBaseSchema } from '@viaa/avo2-types/types/core';
import { ItemSchema } from '@viaa/avo2-types/types/item';

export const isItemWithMeta = (block: Pick<BlockItemBaseSchema, 'type' | 'item_meta'>): boolean => {
	if (block.type === 'ITEM') {
		if (block.item_meta) {
			return (block.item_meta as ItemSchema).depublish_reason === undefined;
		} else {
			return false;
		}
	}

	return true;
};
