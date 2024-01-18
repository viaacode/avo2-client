import { IconName } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';

import { tText } from '../../helpers/translate';

export const BLOCK_ITEM_ICONS: () => Record<
	Avo.Core.BlockItemType,
	(block?: Avo.Core.BlockItemBase) => IconName
> = () => ({
	ITEM: (block: Avo.Core.BlockItemBase | undefined): IconName => {
		if (block?.item_meta) {
			switch (block?.item_meta?.type?.label) {
				case 'audio':
					return IconName.headphone;
				case 'video':
					return IconName.video; // TODO: add custom icon
			}
		}
		return IconName.x;
	},
	TEXT: () => IconName.type,
	ZOEK: () => IconName.search,
	BOUW: () => IconName.search,
	COLLECTION: () => IconName.collection,
});

export const BLOCK_ITEM_LABELS = (
	isPupilCollection: boolean
): Record<Avo.Core.BlockItemType, string> => ({
	ITEM: tText('shared/components/block-list/block-list___fragment'),
	TEXT: isPupilCollection
		? tText('shared/components/block-list/block-list___tekstblok')
		: tText('shared/components/block-list/block-list___instructies-of-tekstblok'),
	ZOEK: tText('shared/components/block-list/block-list___zoekoefening'),
	BOUW: tText('shared/components/block-list/block-list___zoekoefening'),
	COLLECTION: tText('shared/components/block-list/block-list___collectie'),
});
