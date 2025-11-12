import { type Avo } from '@viaa/avo2-types'
import { stringifyUrl } from 'query-string'

import { LTI_JWT_TOKEN_HEADER } from '../embed/embed.types.js'
import { CustomError } from '../shared/helpers/custom-error.js'
import { getEnv } from '../shared/helpers/env.js'
import { ITEMS_PER_PAGE } from '../workspace/workspace.const.js'

import { type EmbedCode } from './embed-code.types.js'

export interface EmbedCodeFilters {
  filterString?: string
  sortColumn?: string
  sortOrder?: Avo.Search.OrderDirection
  limit: number
  offset: number
}

export class EmbedCodeService {
  private static jwtToken = ''

  public static async getEmbedCode(embedId: string | null): Promise<EmbedCode> {
    let url: string | undefined = undefined
    let errorMessage: string | undefined = undefined

    if (!embedId) {
      const error = new CustomError(
        'Failed to get embed code when embedId is empty',
        {
          url,
        },
      )
      console.error(error)
      throw error
    }

    try {
      url = `${getEnv('PROXY_URL')}/embed-codes/${embedId}`

      // Using a regular fetch since we use this method for AVO and the embed iframe
      // For the iframe we need to add extra headers since the authentication goes via the LTI flow and our fetchWithLogoutJson will get in the way
      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          [LTI_JWT_TOKEN_HEADER]: EmbedCodeService.getJwtToken() || '',
        },
        credentials: 'include',
      })

      const responseJson = await response.json()

      if (!response.ok) {
        // This means the external platform and the embed do not match
        if (response.status === 403) {
          errorMessage = responseJson.message
        }
        const error = new CustomError('Failed to get embed code', {
          url,
          errorMessage: responseJson.message,
        })
        throw error
      }

      return responseJson as EmbedCode
    } catch (err) {
      const error = new CustomError('Failed to get embed code', err, {
        url,
        errorMessage,
      })
      console.error(error)
      throw error
    }
  }

  public static async createEmbedCode(data: EmbedCode): Promise<EmbedCode> {
    let url: string | undefined = undefined

    try {
      url = `${getEnv('PROXY_URL')}/embed-codes/`

      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      )
      const responseData = await fetchWithLogoutJson<{
        message: 'success'
        createdEmbed: EmbedCode
      }>(url, {
        method: 'POST',
        body: JSON.stringify(data),
      })

      return responseData.createdEmbed
    } catch (err) {
      const error = new CustomError('Failed to create embed code', err, {
        url,
        data,
      })
      console.error(error)
      throw error
    }
  }

  public static async updateEmbedCode(data: EmbedCode): Promise<void> {
    let url: string | undefined = undefined

    try {
      url = `${getEnv('PROXY_URL')}/embed-codes/${data.id}`

      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      )
      await fetchWithLogoutJson<{
        message: 'success'
        createdEmbed: EmbedCode
      }>(url, {
        method: 'PATCH',
        body: JSON.stringify(data),
      })
    } catch (err) {
      const error = new CustomError('Failed to create embed code', err, {
        url,
        data,
      })
      console.error(error)
      throw error
    }
  }

  public static async getEmbedCodes(params?: EmbedCodeFilters): Promise<{
    embedCodes: EmbedCode[]
    count: number
  }> {
    let url: string | undefined = undefined

    try {
      url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/embed-codes`,
        query: {
          sortColumn: params?.sortColumn,
          sortOrder: params?.sortOrder,
          offset: params?.offset,
          limit: params?.limit || ITEMS_PER_PAGE,
          filterString: params?.filterString,
        },
      })

      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      )
      return await fetchWithLogoutJson<{
        embedCodes: EmbedCode[]
        count: number
      }>(url, {
        method: 'GET',
      })
    } catch (err) {
      const error = new CustomError(
        'Failed to fetch embed codes from database',
        err,
        {
          ...params,
          url,
        },
      )
      console.error(error)
      throw error
    }
  }

  public static async deleteEmbedCode(embedCodeId: string): Promise<void> {
    let url: string | undefined = undefined

    try {
      url = `${getEnv('PROXY_URL')}/embed-codes/${embedCodeId}`

      const { fetchWithLogoutJson } = await import(
        '@meemoo/admin-core-ui/client'
      )
      await fetchWithLogoutJson<{
        message: 'success'
        createdEmbed: EmbedCode
      }>(url, {
        method: 'DELETE',
      })
    } catch (err) {
      const error = new CustomError('Failed to delete embed code', err, {
        url,
        embedCodeId,
      })
      console.error(error)
      throw error
    }
  }

  /**
   * Embed codes inside an iframe will have a query param: jwtToken containing a token to authenticate api requests
   * After the user has logged in, or when the external platform has provided enough info to log in the user through the LTI login flow
   * @private
   */
  public static setJwtToken(token: string): void {
    this.jwtToken = token
  }

  /**
   * Embed codes inside an iframe will have a query param: jwtToken containing a token to authenticate api requests
   * After the user has logged in, or when the external platform has provided enough info to log in the user through the LTI login flow
   * @private
   */
  public static getJwtToken(): string | null {
    return this.jwtToken
  }
}
