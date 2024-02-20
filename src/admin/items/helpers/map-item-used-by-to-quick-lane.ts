import { UserProfile, UserSchema } from '@viaa/avo2-types/types/user';

import { QuickLaneFilterTableCellProps } from '../../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { ItemUsedByEntry } from '../items.types';

export function mapItemUsedByToQuickLane(
	input: ItemUsedByEntry
): QuickLaneFilterTableCellProps['data'] {
	return {
		...input,
		owner: {
			user: {
				full_name: input.owner,
			} as UserSchema,
		} as UserProfile,
		created_at: input.createdAt,
	};
}
