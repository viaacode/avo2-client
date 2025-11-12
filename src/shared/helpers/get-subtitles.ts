import { type FlowplayerTrackSchema } from '@meemoo/react-components'
import { type Avo } from '@viaa/avo2-types'

import { getEnv } from './env.js'
import { tText } from './translate-text.js'

export function getSubtitles(
  item: Avo.Item.Item | undefined | null,
): FlowplayerTrackSchema[] | undefined {
  const collaterals = item?.item_collaterals || []
  if (!collaterals.length) {
    return undefined
  }
  return collaterals.map(
    (collateral: Avo.Item.Subtitle, index: number): FlowplayerTrackSchema => {
      return {
        id: collateral.external_id,
        default: index === 0,
        src: `${getEnv('PROXY_URL')}/subtitles/convert-srt-to-vtt${collateral.path}`,
        label: tText('shared/helpers/get-subtitles___nederlands') + (index + 1),
      }
    },
  )
}
