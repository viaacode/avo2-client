import { type UserProfile, type UserSchema } from '@viaa/avo2-types/types/user';

import { type QuickLaneFilterTableCellProps } from '../../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { type ItemUsedByEntry } from '../items.types';

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
