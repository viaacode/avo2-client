import { type Avo } from '@viaa/avo2-types'

import { type MinimalClientEvent } from '../../shared/services/event-logging-service.js'
import { type EmbedCode } from '../embed-code.types.js'

export function createResource(
  embedCode: EmbedCode,
  commonUser: Avo.User.CommonUser,
): MinimalClientEvent['resource'] {
  const content = embedCode?.content as Avo.Item.Item
  const userGroup = commonUser.userGroup

  return {
    // User related
    profileId: commonUser?.profileId || '',
    userGroup: userGroup?.label || userGroup?.id || '',

    // Content related
    pidVideo: content.external_id,
    organisation: content.organisation?.name,

    // Embed code related
    externalWebsite: embedCode.externalWebsite,
  }
}
