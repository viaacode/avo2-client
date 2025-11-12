import { Modal, ModalBody } from '@viaa/avo2-components'
import React, { type FC, type ReactNode } from 'react'

import { type EmailTemplateType } from '../../services/campaign-monitor-service.js'
import { ShareThroughEmailContent } from '../ShareThroughEmailContent/ShareThroughEmailContent.js'

interface AddToCollectionModalProps {
  modalTitle: string | ReactNode
  type: EmailTemplateType
  emailLinkHref: string
  emailLinkTitle: string
  isOpen: boolean
  onClose: () => void
}

export const ShareThroughEmailModal: FC<AddToCollectionModalProps> = ({
  modalTitle,
  type,
  emailLinkHref,
  emailLinkTitle,
  isOpen,
  onClose,
}) => {
  return (
    <Modal
      className="m-share-through-email-modal"
      title={modalTitle}
      size="medium"
      isOpen={isOpen}
      onClose={onClose}
      scrollable
    >
      <ModalBody>
        <ShareThroughEmailContent
          emailLinkHref={emailLinkHref}
          emailLinkTitle={emailLinkTitle}
          type={type}
          onSendMail={onClose}
        />
      </ModalBody>
    </Modal>
  )
}
