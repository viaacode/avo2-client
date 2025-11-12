import { noop } from 'es-toolkit'
import React, { type FC } from 'react'

import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal.js'
import { tHtml } from '../../../shared/helpers/translate-html.js'
import { tText } from '../../../shared/helpers/translate-text.js'

interface DeleteCollectionModalProps {
  isOpen: boolean
  onClose?: () => void
  deleteCallback: () => void
  contributorCount: number

  // true: collection, false: bundle
  isCollection: boolean
}

export const DeleteCollectionModal: FC<DeleteCollectionModalProps> = ({
  isOpen,
  onClose = noop,
  deleteCallback,
  contributorCount,
  isCollection,
}) => {
  const handleDelete = async () => {
    deleteCallback()
    onClose()
  }

  const renderDeleteMessageParagraph = () => {
    let warning = null
    if (contributorCount === 1) {
      // Will never happen for bundels since they cannot be shared
      warning = tHtml(
        'collection/components/modals/delete-collection-modal___deze-opdracht-is-met-1-andere-persoon-gedeeld-deze-verliest-dan-toegang',
      )
    } else if (contributorCount > 1) {
      // Will never happen for bundels since they cannot be shared
      warning = tHtml(
        'collection/components/modals/delete-collection-modal___deze-opdracht-is-met-count-andere-mensen-gedeeld-deze-verliezen-dan-toegang',
        { count: contributorCount },
      )
    }

    return (
      <>
        {warning}
        {warning && <br />}
        {isCollection
          ? tHtml(
              'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-deze-collectie-wil-verwijderen',
            )
          : tHtml(
              'collection/components/modals/delete-collection-modal___ben-je-zeker-dat-je-deze-bundel-wil-verwijderen',
            )}
      </>
    )
  }

  const renderDeleteMessage = () => {
    return (
      <p>
        {renderDeleteMessageParagraph()}
        <br />
        {isCollection
          ? tHtml(
              'collection/components/modals/delete-collection-modal___deze-operatie-kan-niet-meer-ongedaan-gemaakt-worden-collectie',
            )
          : tHtml(
              'collection/components/modals/delete-collection-modal___deze-operatie-kan-niet-meer-ongedaan-gemaakt-worden-bundel',
            )}
      </p>
    )
  }

  return (
    <ConfirmModal
      isOpen={isOpen}
      title={
        isCollection
          ? tHtml(
              'collection/components/modals/delete-collection-modal___verwijder-deze-collectie',
            )
          : tHtml(
              'collection/components/modals/delete-collection-modal___deze-bundel-verwijderen',
            )
      }
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
