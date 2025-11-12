import { sanitizeHtml, SanitizePreset } from '@meemoo/admin-core-ui/client'
import React, { type FC } from 'react'

export interface HtmlProps {
  content: string
  sanitizePreset?: SanitizePreset
  type?: 'p' | 'div' | 'span'
  className?: string
}

export const Html: FC<HtmlProps> = ({
  content,
  sanitizePreset = SanitizePreset.link,
  type = 'p',
  className,
}) => {
  const Type = type

  return (
    <Type
      dangerouslySetInnerHTML={{
        __html: sanitizeHtml(content, sanitizePreset),
      }}
      className={className}
    />
  )
}
