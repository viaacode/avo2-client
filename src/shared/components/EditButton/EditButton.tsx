import {
  Button,
  IconName,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@viaa/avo2-components'
import React, { type FC, type ReactNode } from 'react'

type EditButtonProps = {
  onClick: () => void
  title: string
  label: string
  type?: string
  disabled: boolean
  toolTipContent: string | ReactNode
}

export const EditButton: FC<EditButtonProps> = ({
  title,
  label,
  onClick,
  type,
  disabled,
  toolTipContent: toolTipText,
}) => {
  const button = (
    <Button
      type={type || 'primary'}
      icon={IconName.edit}
      label={label}
      title={title}
      onClick={onClick}
      disabled={disabled}
    />
  )

  if (disabled) {
    return (
      <Tooltip position="bottom">
        <TooltipTrigger>{button}</TooltipTrigger>
        <TooltipContent>
          <p>{toolTipText}</p>
        </TooltipContent>
      </Tooltip>
    )
  }
  return button
}
