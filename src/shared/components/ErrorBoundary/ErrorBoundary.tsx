import { IconName } from '@viaa/avo2-components'
import React from 'react'
import { useRouteError } from 'react-router'

import { ErrorView } from '../../../error/views/ErrorView.js'
import { tText } from '../../helpers/translate-text.js'

import './ErrorBoundary.scss'

export function ErrorBoundary() {
  const error = useRouteError() as any

  return (
    <ErrorView
      icon={IconName.alertTriangle}
      message={
        <>
          {tText(
            'shared/components/error-boundary/error-boundary___een-onverwachte-error-is-opgetreden-als-dit-blijft-voorkomen-neem-contact-op-met-de-helpdesk',
          )}
          <br />
          <span className="c-error-boundary__error-message">
            {error?.status} {error?.statusText} {error?.message}
          </span>
        </>
      }
      actionButtons={['home', 'helpdesk']}
    />
  )
}
