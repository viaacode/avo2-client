import { IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { tText } from '../../helpers/translate';
import { BaseBlockWithMeta } from '../../../assignment/assignment.types';

export const BLOCK_ITEM_ICONS: () => Record<
	Avo.Core.BlockItemType,
	(block?: BaseBlockWithMeta) => IconName
> = () => ({
	ITEM: (block: BaseBlockWithMeta | undefined): IconName => {
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
	BOUW: () => 'search',
	COLLECTION: () => 'collection',
});

export const BLOCK_ITEM_LABELS = (): Record<Avo.Core.BlockItemType, string> => ({
	ITEM: tText('shared/components/block-list/block-list___fragment'),
	TEXT: tText('shared/components/block-list/block-list___instructies-of-tekstblok'),
	ZOEK: tText('shared/components/block-list/block-list___zoekoefening'),
	BOUW: tText('shared/components/block-list/block-list___zoekoefening'),
	COLLECTION: tText('shared/components/block-list/block-list___collectie'),
});
