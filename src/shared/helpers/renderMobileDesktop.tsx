import { type ReactNode } from 'react'

import './renderMobileDesktop.scss'

/**
 * Renders mobile parameter if width is < 700, renders desktop param in width is larger
 * Careful, this component renders both cases, so sometimes you don't want both to be rendered. Like for overflow menu's that open by id
 * @param children
 * @deprecated This component causes a lot of issues with double rendered buttons, we should stop using it
 * https://meemoo.atlassian.net/browse/AVO-3206
 */
export function renderMobileDesktop(children: {
  mobile: ReactNode
  desktop: ReactNode
}): ReactNode {
  return (
    <>
      <div className="u-hide-gte-bp2">{children.mobile}</div>
      <div className="u-hide-lt-bp2">{children.desktop}</div>
    </>
  )
}
