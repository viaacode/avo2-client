import { type Avo } from '@viaa/avo2-types'

import { tText } from '../../helpers/translate-text.js'

export const BLOCK_ITEM_LABELS = (
  isPupilCollection: boolean,
): Record<Avo.Core.BlockItemType, string> => ({
  ITEM: tText('shared/components/block-list/block-list___fragment'),
  TEXT: isPupilCollection
    ? tText('shared/components/block-list/block-list___tekstblok')
    : tText(
        'shared/components/block-list/block-list___instructies-of-tekstblok',
      ),
  ZOEK: tText('shared/components/block-list/block-list___zoekoefening'),
  BOUW: tText('shared/components/block-list/block-list___zoekoefening'),
  COLLECTION: tText('shared/components/block-list/block-list___collectie'),
  ASSIGNMENT: tText('shared/components/block-list/block-list___opdracht'),
})
