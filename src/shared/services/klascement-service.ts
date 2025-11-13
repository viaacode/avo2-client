import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client'
import { stringifyUrl } from 'query-string'

import { CustomError } from '../helpers/custom-error';
import { getEnv } from '../helpers/env';

export interface KlascementPublishCollectionData {
  collectionId: string
  imageUrl: string
  altText: string
  sourceText: string
}

export interface KlascementPublishCollectionResponse {
  message: 'success'
  createdCollectionId: number
}

export interface KlascementPublishAssignmentResponse {
  message: 'success'
  createdAssignmentId: number
}

export interface KlascementCollectionPublishInfo {
  id: string
  alt_text: string
  image_url: string
  source_text: string
  klascement_id: number | null
}

export interface KlascementAssignmentPublishInfo {
  id: string
  klascement_id: number | null
}

export class KlascementService {
  public static async getKlascementPublishInfoForCollection(
    collectionId: string,
  ): Promise<KlascementCollectionPublishInfo | null> {
    try {
      const url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/klascement/collection`,
        query: { collectionId },
      })
      return await fetchWithLogoutJson(url)
    } catch (err) {
      throw new CustomError(
        'Failed to get klascement publish information for collection',
        err,
        {
          collectionId,
        },
      )
    }
  }

  public static async publishCollection(
    data: KlascementPublishCollectionData,
  ): Promise<number> {
    let url: string | undefined = undefined

    try {
      url = `${getEnv('PROXY_URL')}/klascement/publish/collection`

      const response =
        await fetchWithLogoutJson<KlascementPublishCollectionResponse>(url, {
          method: 'POST',
          body: JSON.stringify(data),
          forceLogout: false,
        })
      return response.createdCollectionId
    } catch (err) {
      throw new CustomError('Failed to publish collection to Klascement', err, {
        url,
        data,
      })
    }
  }

  public static async getKlascementPublishInfoForAssignment(
    assignmentId: string,
  ): Promise<KlascementAssignmentPublishInfo | null> {
    try {
      const url = stringifyUrl({
        url: `${getEnv('PROXY_URL')}/klascement/assignment`,
        query: { assignmentId },
      })
      return await fetchWithLogoutJson(url)
    } catch (err) {
      throw new CustomError(
        'Failed to get klascement publish information for assignment',
        err,
        {
          assignmentId,
        },
      )
    }
  }

  public static async publishAssignment(assignmentId: string): Promise<number> {
    let url: string | undefined = undefined

    try {
      url = `${getEnv('PROXY_URL')}/klascement/publish/assignment`

      const response =
        await fetchWithLogoutJson<KlascementPublishAssignmentResponse>(url, {
          method: 'POST',
          body: JSON.stringify({ assignmentId }),
          forceLogout: false,
        })
      return response.createdAssignmentId
    } catch (err) {
      throw new CustomError('Failed to publish assignment to Klascement', err, {
        url,
        assignmentId,
      })
    }
  }
}
