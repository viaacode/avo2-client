import { type ReactNode } from 'react'

import { type QuickLaneContentProps } from '../QuickLaneContent/QuickLaneContent.types.js'

export interface QuickLaneModalProps extends QuickLaneContentProps {
  modalTitle: string | ReactNode
  onClose?: () => void
}
