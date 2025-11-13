import { Modal, ModalBody } from '@viaa/avo2-components'
import React, { type FC } from 'react'

import { QuickLaneContent } from '../QuickLaneContent/QuickLaneContent';

import { type QuickLaneModalProps } from './QuickLaneModal.types';

export const QuickLaneModal: FC<QuickLaneModalProps> = (props) => {
  const { modalTitle, isOpen, onClose } = props

  return (
    <Modal
      className="m-quick-lane-modal"
      title={modalTitle}
      size="medium"
      isOpen={isOpen}
      onClose={onClose}
      scrollable
    >
      <ModalBody>
        <QuickLaneContent {...props} />
      </ModalBody>
    </Modal>
  )
}
