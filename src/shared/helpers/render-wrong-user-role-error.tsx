import { IconName } from '@viaa/avo2-components'
import React from 'react'

import { GET_ERROR_MESSAGES } from '../../dynamic-route-resolver/dynamic-route-resolver.const.js'
import { ErrorView } from '../../error/views/ErrorView.js'

export function renderWrongUserRoleError() {
  return (
    <ErrorView
      icon={IconName.clock}
      actionButtons={['help', 'helpdesk']}
      message={GET_ERROR_MESSAGES()[`OTHER_ROLES`]}
    />
  )
}
