import { BlockItemBaseSchema } from '@viaa/avo2-types/types/core';

export const isItemWithMeta = (block: Pick<BlockItemBaseSchema, 'type' | 'item_meta'>): boolean => {
	if (block.type === 'ITEM') {
		return !!block.item_meta;
	}

	return true;
};
