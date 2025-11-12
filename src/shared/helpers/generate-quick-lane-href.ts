import { generatePath } from 'react-router'

import { APP_PATH } from '../../constants.js'
import { ToastService } from '../services/toast-service.js'

import { tHtml } from './translate-html.js'

export const generateQuickLaneHref = (id: string): string => {
  return generatePath(APP_PATH.QUICK_LANE.route, { id })
}

export const copyQuickLaneToClipboard = (id: string): void => {
  navigator.clipboard
    .writeText(`${window.location.origin}${generateQuickLaneHref(id)}`)
    .then(() => {
      ToastService.success(
        tHtml(
          'shared/helpers/generate-quick-lane-href___de-link-is-succesvol-gekopieerd',
        ),
      )
    })
}
