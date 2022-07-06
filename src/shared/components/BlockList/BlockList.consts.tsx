import { IconName } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { TFunction } from 'i18next';

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

export const BLOCK_ITEM_LABELS: (t: TFunction) => Record<Avo.Core.BlockItemType, string> = (t) => ({
	ITEM: t('Fragment'),
	TEXT: t('Instructies of tekstblok'),
	ZOEK: t('Zoekoefening'),
	COLLECTION: t('collectie'),
});
