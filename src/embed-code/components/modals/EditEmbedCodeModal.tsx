import { Modal, ModalBody, type ModalRef } from '@viaa/avo2-components'
import { createRef, type FC, type ReactNode } from 'react'

import { tHtml } from '../../../shared/helpers/translate-html';
import {
  type EmbedCode,
  EmbedCodeExternalWebsite,
} from '../../embed-code.types';
import { EmbedContent } from '../EmbedContent';

import './EditEmbedCodeModal.scss'

type EditEmbedCodeModalProps = {
  embedCode?: EmbedCode
  isOpen: boolean
  handleUpdate: (item: EmbedCode) => Promise<void>
  onClose: () => void
}

export const EditEmbedCodeModal: FC<EditEmbedCodeModalProps> = ({
  embedCode,
  isOpen,
  handleUpdate,
  onClose,
}) => {
  const modalRef = createRef<ModalRef>()

  const renderEmbedContentDescription = (): string | ReactNode => {
    switch (embedCode?.externalWebsite) {
      case EmbedCodeExternalWebsite.SMARTSCHOOL:
        return tHtml(
          'embed-code/components/modals/edit-embed-code-modal___let-op-de-aanpassingen-komen-meteen-door-overal-waar-je-dit-fragment-insloot-in-smartschool',
        )
      case EmbedCodeExternalWebsite.BOOKWIDGETS:
        return tHtml(
          'embed-code/components/modals/edit-embed-code-modal___let-op-de-aanpassingen-komen-meteen-door-overal-waar-je-dit-fragment-insloot-in-bookwidgets',
        )
      default:
        return ''
    }
  }

  return (
    <Modal
      ref={modalRef}
      isOpen={isOpen}
      size="large"
      scrollable={true}
      onClose={onClose}
      disablePageScroll={true}
      title={tHtml(
        'embed-code/components/modals/edit-embed-code-modal___fragment-bewerken',
      )}
    >
      <ModalBody>
        <EmbedContent
          item={embedCode || null}
          contentDescription={renderEmbedContentDescription()}
          onClose={onClose}
          onSave={handleUpdate}
          onResize={() => modalRef?.current?.updateSize()}
        />
      </ModalBody>
    </Modal>
  )
}
