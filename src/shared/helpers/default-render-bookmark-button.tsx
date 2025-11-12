import {
  IconName,
  ToggleButton,
  type ToggleButtonProps,
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from '@viaa/avo2-components'
import React, { type ReactNode } from 'react'

export type renderBookmarkButtonProps = Pick<
  ToggleButtonProps,
  'active' | 'onClick' | 'ariaLabel' | 'title' | 'type'
>

const getBookmarkButton = (props: renderBookmarkButtonProps): ReactNode => {
  return <ToggleButton type="tertiary" icon={IconName.bookmark} {...props} />
}

export const defaultRenderBookmarkButton = (
  props: renderBookmarkButtonProps,
): ReactNode => {
  if (props.title) {
    return (
      <Tooltip position="bottom">
        <TooltipTrigger>
          {getBookmarkButton({ ...props, title: '' })}
        </TooltipTrigger>
        <TooltipContent>
          <span>{props.title}</span>
        </TooltipContent>
      </Tooltip>
    )
  }

  return getBookmarkButton(props)
}
