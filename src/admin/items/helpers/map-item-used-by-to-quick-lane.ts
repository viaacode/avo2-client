import { AvoUserProfile, AvoUserUser } from '@viaa/avo2-types';

import { type QuickLaneFilterTableCellProps } from '../../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { type ItemUsedByEntry } from '../items.types';

export function mapItemUsedByToQuickLane(
  input: ItemUsedByEntry,
): QuickLaneFilterTableCellProps['data'] {
  return {
    ...input,
    owner: {
      user: {
        full_name: input.owner,
      } as AvoUserUser,
    } as AvoUserProfile,
    created_at: input.createdAt,
  };
}
