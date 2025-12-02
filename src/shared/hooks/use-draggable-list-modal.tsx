import { Button, type ButtonProps, IconName } from '@viaa/avo2-components'
import { isNil } from 'es-toolkit'
import { type ReactNode, useState } from 'react'

import { DraggableBlock } from '../components/DraggableBlock/DraggableBlock';
import {
  DraggableListModal,
  type DraggableListModalProps,
} from '../components/DraggableList/DraggableListModal';
import { tText } from '../helpers/translate-text';

export function useDraggableListModal(config?: {
  button?: Partial<ButtonProps>
  modal?: Partial<DraggableListModalProps>
  setIsOpen?: (isOpen: boolean) => void // Optional, if not passed, the hook will keep track of the open state
}): [ReactNode, ReactNode] {
  const [isOpen, setIsOpen] = useState<boolean>(false)

  const button = (
    <Button
      icon={IconName.shuffle}
      {...config?.button}
      type="secondary"
      label={
        config?.button?.label ||
        tText(
          'collection/components/collection-or-bundle-edit___herorden-fragmenten',
        )
      }
      title={tText(
        'shared/hooks/use-draggable-list-modal___herorden-de-onderdelen-via-drag-and-drop',
      )}
      onClick={(e) => {
        ;(config?.setIsOpen || setIsOpen)(true)
        config?.button?.onClick?.(e)
      }}
    />
  )

  const modal = (
    <DraggableListModal
      {...config?.modal}
      renderItem={(item) => <DraggableBlock block={item} />}
      isOpen={
        isNil(config?.modal?.isOpen) ? isOpen : config?.modal?.isOpen || false
      } // Allow external config to open modal, if not provided, internal isOpen state will be used
      onClose={(update?: any[]) => {
        ;(config?.setIsOpen || setIsOpen)(false)
        config?.modal?.onClose?.(update)
      }}
    />
  )

  return [button, modal]
}
