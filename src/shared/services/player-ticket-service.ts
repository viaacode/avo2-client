import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client'

import { LTI_JWT_TOKEN_HEADER } from '../../embed/embed.types';
import { EmbedCodeService } from '../../embed-code/embed-code-service';
import { CustomError } from '../helpers/custom-error';
import { getEnv } from '../helpers/env';

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
