import { ItemSchema } from '@viaa/avo2-types/types/item';

import { BaseBlockWithMeta } from '../assignment.types';

export const isItemWithMeta = (block: BaseBlockWithMeta): boolean => {
	if (block.type === 'ITEM') {
		if (block.item_meta) {
			return (block.item_meta as ItemSchema).depublish_reason === undefined;
		} else {
			return false;
		}
	}

	return true;
};
