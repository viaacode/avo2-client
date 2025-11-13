import { noop } from 'es-toolkit'
import React, { type FC } from 'react'

import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';

interface DeleteMyselfFromCollectionContributorsConfirmModalProps {
  isOpen: boolean
  onClose?: () => void
  deleteCallback: () => void | Promise<void>
}

export const DeleteMyselfFromCollectionContributorsConfirmModal: FC<
  DeleteMyselfFromCollectionContributorsConfirmModalProps
> = ({ isOpen, onClose = noop, deleteCallback }) => {
  const handleDelete = async () => {
    deleteCallback()
    onClose()
  }

  const renderDeleteMessage = () => {
    return (
      <p>
        {tHtml(
          'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-jezelf-van-deze-collectie-wil-wissen',
        )}
        <br />
        {tHtml(
          'collection/components/modals/delete-collection-modal___deze-operatie-kan-niet-meer-ongedaan-gemaakt-worden',
        )}
      </p>
    )
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={tHtml(
        'collection/components/modals/delete-collection-modal___verwijder-mij-van-deze-collectie',
      )}
      body={renderDeleteMessage()}
      cancelLabel={tText(
        'collection/components/modals/delete-collection-modal___annuleer',
      )}
      confirmLabel={tText(
        'collection/components/modals/delete-collection-modal___verwijder',
      )}
      size="large"
      onClose={onClose}
      className="c-content"
      confirmCallback={handleDelete}
    />
  )
}
