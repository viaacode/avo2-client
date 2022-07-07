import { IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import i18n from '../../translations/i18n';

export const BLOCK_ITEM_ICONS: () => Record<
	Avo.Core.BlockItemType,
	(block?: Avo.Core.BlockItemBase) => IconName
> = () => ({
	ITEM: (block: Avo.Core.BlockItemBase | undefined): IconName => {
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

export const BLOCK_ITEM_LABELS = (): Record<Avo.Core.BlockItemType, string> => ({
	ITEM: i18n.t('Fragment'),
	TEXT: i18n.t('Instructies of tekstblok'),
	ZOEK: i18n.t('Zoekoefening'),
	COLLECTION: i18n.t('collectie'),
});
