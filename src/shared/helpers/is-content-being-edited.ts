import { AvoShareEditStatus } from '@viaa/avo2-types';

export function isContentBeingEdited(
  editStatus: AvoShareEditStatus | null | undefined,
  currentUserProfileId: string | null | undefined,
): boolean {
  return !!editStatus && editStatus.editingUserId !== currentUserProfileId;
}
