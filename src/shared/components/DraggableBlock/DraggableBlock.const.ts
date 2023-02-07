import { IconName } from '@viaa/avo2-components';
import type { Avo } from '@viaa/avo2-types';

export const DRAGGABLE_BLOCK_ICONS: Record<Avo.Core.BlockItemType, IconName> = {
	BOUW: IconName.collection,
	COLLECTION: IconName.collection,
	ITEM: IconName.video,
	TEXT: IconName.type,
	ZOEK: IconName.search,
};
