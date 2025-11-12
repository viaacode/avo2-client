import { type Avo } from '@viaa/avo2-types'

export function isContentBeingEdited(
  editStatus: Avo.Share.EditStatus | null | undefined,
  currentUserProfileId: string | null | undefined,
): boolean {
  return !!editStatus && editStatus.editingUserId !== currentUserProfileId
}
