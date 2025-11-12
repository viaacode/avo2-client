import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client'

import { LTI_JWT_TOKEN_HEADER } from '../../embed/embed.types.js'
import { EmbedCodeService } from '../../embed-code/embed-code-service.js'
import { CustomError } from '../helpers/custom-error.js'
import { getEnv } from '../helpers/env.js'

export const fetchPlayerTicket = async (
  externalId: string,
): Promise<string> => {
  return (await fetchPlayerTickets([externalId]))[0]
}

export const fetchPlayerTickets = async (
  externalIds: string[],
): Promise<string[]> => {
  try {
    const url = `${getEnv('PROXY_URL')}/admin/player-ticket?externalIds=${externalIds}`

    return fetchWithLogoutJson<string[]>(url, {
      headers: {
        [LTI_JWT_TOKEN_HEADER]: EmbedCodeService.getJwtToken() || '',
      },
    })
  } catch (err) {
    throw new CustomError('Failed to get player tickets', err, { externalIds })
  }
}
