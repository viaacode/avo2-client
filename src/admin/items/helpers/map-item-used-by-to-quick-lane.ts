import { type Avo } from '@viaa/avo2-types'

import { type QuickLaneFilterTableCellProps } from '../../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell.js'
import { type ItemUsedByEntry } from '../items.types.js'

export function mapItemUsedByToQuickLane(
  input: ItemUsedByEntry,
): QuickLaneFilterTableCellProps['data'] {
  return {
    ...input,
    owner: {
      user: {
        full_name: input.owner,
      } as Avo.User.User,
    } as Avo.User.Profile,
    created_at: input.createdAt,
  }
}
