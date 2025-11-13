import { type ReactNode } from 'react'

import { type QuickLaneContentProps } from '../QuickLaneContent/QuickLaneContent.types';

export interface QuickLaneModalProps extends QuickLaneContentProps {
  modalTitle: string | ReactNode
  onClose?: () => void
}
