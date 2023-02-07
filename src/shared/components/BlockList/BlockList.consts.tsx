import { IconName } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';

import { BaseBlockWithMeta } from '../../../assignment/assignment.types';
import { tText } from '../../helpers/translate';

export const BLOCK_ITEM_ICONS: () => Record<
	Avo.Core.BlockItemType,
	(block?: BaseBlockWithMeta) => IconName
> = () => ({
	ITEM: (block: BaseBlockWithMeta | undefined): IconName => {
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

export const BLOCK_ITEM_LABELS = (): Record<Avo.Core.BlockItemType, string> => ({
	ITEM: tText('shared/components/block-list/block-list___fragment'),
	TEXT: tText('shared/components/block-list/block-list___instructies-of-tekstblok'),
	ZOEK: tText('shared/components/block-list/block-list___zoekoefening'),
	BOUW: tText('shared/components/block-list/block-list___zoekoefening'),
	COLLECTION: tText('shared/components/block-list/block-list___collectie'),
});
