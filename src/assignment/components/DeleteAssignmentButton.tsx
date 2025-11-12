import {
  Button,
  type ButtonProps,
  type DefaultProps,
  IconName,
} from '@viaa/avo2-components'
import { type Avo, PermissionName } from '@viaa/avo2-types'
import { useAtomValue } from 'jotai'
import React, { type FC, useState } from 'react'

import { commonUserAtom } from '../../authentication/authentication.store.js'
import { PermissionService } from '../../authentication/helpers/permission-service.js'
import {
  ConfirmModal,
  type ConfirmModalProps,
} from '../../shared/components/ConfirmModal/ConfirmModal.js'
import { tText } from '../../shared/helpers/translate-text.js'
import { ToastService } from '../../shared/services/toast-service.js'
import {
  deleteAssignment,
  deleteAssignmentWarning,
} from '../helpers/delete-assignment.js'

export type DeleteAssignmentButtonProps = DefaultProps & {
  assignment?: Avo.Assignment.Assignment
  button?: Partial<ButtonProps>
  modal?: Partial<ConfirmModalProps>
}

export const DeleteAssignmentButton: FC<DeleteAssignmentButtonProps> = ({
  assignment,
  button,
  modal,
}) => {
  const commonUser = useAtomValue(commonUserAtom)

  const [isOpen, setOpen] = useState<boolean>(false)
  const canDeleteAnyAssignments = PermissionService.hasPerm(
    commonUser,
    PermissionName.DELETE_ANY_ASSIGNMENTS,
  )
  const isOwner =
    !!assignment?.owner_profile_id &&
    assignment?.owner_profile_id === commonUser?.profileId

  const onConfirm = async () => {
    if (!commonUser?.profileId) {
      ToastService.danger(
        tText(
          'assignment/components/delete-assignment-button___je-moet-ingelogd-zijn-om-een-opdracht-te-verwijderen',
        ),
      )
      return
    }

    assignment && (await deleteAssignment(assignment, commonUser))

    setOpen(false)
    modal?.confirmCallback && modal.confirmCallback()
  }

  return (
    <>
      <Button
        altTitle={tText(
          'assignment/components/delete-assignment-button___verwijder-de-opdracht',
        )}
        ariaLabel={tText(
          'assignment/components/delete-assignment-button___verwijder-de-opdracht',
        )}
        icon={IconName.delete}
        label={
          canDeleteAnyAssignments || isOwner
            ? tText(
                'assignment/components/delete-assignment-button___verwijderen',
              )
            : tText(
                'assignment/components/delete-assignment-button___verwijder-mij-van-deze-opdracht',
              )
        }
        title={tText(
          'assignment/components/delete-assignment-button___verwijder-de-opdracht',
        )}
        type="borderless"
        {...button}
        onClick={(e) => {
          setOpen(true)
          button?.onClick && button.onClick(e)
        }}
      />
      <ConfirmModal
        title={tText(
          'assignment/views/assignment-overview___ben-je-zeker-dat-je-deze-opdracht-wil-verwijderen',
        )}
        body={deleteAssignmentWarning(assignment, commonUser?.profileId)}
        {...modal}
        isOpen={isOpen}
        onClose={() => {
          setOpen(false)
          modal?.onClose && modal.onClose()
        }}
        confirmCallback={async () => await onConfirm()}
      />
    </>
  )
}
