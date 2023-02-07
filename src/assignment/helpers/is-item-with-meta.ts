import { Avo } from '@viaa/avo2-types';

import { BaseBlockWithMeta } from '../assignment.types';

export const isItemWithMeta = (block: BaseBlockWithMeta): boolean => {
	if (block.type === 'ITEM') {
		if (block.item_meta) {
			return (block.item_meta as Avo.Item.Item).depublish_reason === undefined;
		} else {
			return false;
		}
	}

	return true;
};
