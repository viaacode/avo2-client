import {
  Button,
  ButtonToolbar,
  type ButtonType,
  Checkbox,
  FormGroup,
  Modal,
  ModalBody,
  type ModalProps,
  Spacer,
  Toolbar,
  ToolbarItem,
  ToolbarRight,
} from '@viaa/avo2-components'
import { noop } from 'es-toolkit'
import React, { type FC, type ReactNode, useEffect, useState } from 'react'

import { tHtml } from '../../helpers/translate-html';

import { type ConfirmModalRememberKey } from './ConfirmModal.consts';

export interface ConfirmModalProps {
  title?: string | ReactNode
  body?: string | ReactNode
  cancelLabel?: string
  confirmLabel?: string
  confirmButtonType?: ButtonType
  size?: ModalProps['size']
  isOpen: boolean
  onClose?: () => void
  confirmCallback?: () => void
  className?: string
  rememberKey?: ConfirmModalRememberKey
}

export const ConfirmModal: FC<ConfirmModalProps> = ({
  title,
  body,
  cancelLabel = 'Annuleer',
  confirmLabel = 'Verwijder',
  confirmButtonType = 'danger',
  size = 'small',
  onClose = noop,
  isOpen,
  confirmCallback = noop,
  className,
  rememberKey,
}) => {
  const [isRemembered, setIsRemembered] = useState(false)

  useEffect(() => {
    if (rememberKey) {
      setIsRemembered(localStorage.getItem(rememberKey) === 'true')
    }
  }, [rememberKey])

  const handleSetRemembered = () => {
    if (rememberKey) {
      const newValue = !isRemembered
      setIsRemembered(newValue)
      localStorage.setItem(rememberKey, String(newValue))
    }
  }

  return (
    <Modal
      className={className}
      isOpen={isOpen}
      title={
        title ||
        tHtml(
          'shared/components/delete-object-modal/delete-object-modal___ben-je-zeker-dat-je-deze-actie-wil-uitvoeren',
        )
      }
      size={size}
      onClose={onClose}
      scrollable
    >
      <ModalBody>
        {!!body && body}
        {!!rememberKey && (
          <Spacer margin="top">
            <FormGroup>
              <Checkbox
                label={tHtml(
                  'shared/components/confirm-modal/confirm-modal___deze-boodschap-niet-meer-tonen-in-de-toekomst',
                )}
                checked={isRemembered}
                onChange={handleSetRemembered}
              />
            </FormGroup>
          </Spacer>
        )}
        <Toolbar spaced>
          <ToolbarRight>
            <ToolbarItem>
              <ButtonToolbar>
                <Button
                  type="secondary"
                  label={cancelLabel}
                  onClick={onClose}
                />
                <Button
                  type={confirmButtonType}
                  label={confirmLabel}
                  onClick={confirmCallback}
                />
              </ButtonToolbar>
            </ToolbarItem>
          </ToolbarRight>
        </Toolbar>
      </ModalBody>
    </Modal>
  )
}
