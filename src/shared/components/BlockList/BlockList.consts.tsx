import { IconName } from '@viaa/avo2-components';

import { BlockItemBase, BlockItemType } from './BlockList.types';

export const BLOCK_ITEM_ICONS: () => Record<
	BlockItemType,
	(block?: BlockItemBase) => IconName
> = () => ({
	ITEM: (block: BlockItemBase | undefined): IconName => {
		if (block?.item_meta) {
			switch (block?.item_meta?.type?.label) {
				case 'audio':
					return 'headphone';
				case 'video':
					return 'video'; // TODO: add custom icon
			}
		}
		return 'x';
	},
	TEXT: () => 'type',
	ZOEK: () => 'search',
	COLLECTION: () => 'collection',
});
