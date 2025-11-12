import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/client'
import { type Avo } from '@viaa/avo2-types'

import { CustomError } from '../helpers/custom-error.js'
import { getEnv } from '../helpers/env.js'

export class FileUploadService {
  private static fileToBase64(file: File): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () =>
        resolve(reader.result ? reader.result.toString() : null)
      reader.onerror = (error) => reject(error)
    })
  }

  public static async uploadFile(
    file: File,
    assetType: Avo.FileUpload.AssetType,
    ownerId: string,
  ): Promise<string> {
    if (assetType === 'ZENDESK_ATTACHMENT') {
      return await FileUploadService.uploadFileToZendesk(file)
    }
    const { AssetsService } = await import('@meemoo/admin-core-ui/admin')
    return await AssetsService.uploadFile(file, assetType, ownerId)
  }

  public static async uploadFileToZendesk(file: File): Promise<string> {
    let url: string | undefined
    let body: Avo.FileUpload.ZendeskFileInfo | undefined = undefined
    try {
      url = `${getEnv('PROXY_URL')}/zendesk/upload-attachment`
      const base64 = await this.fileToBase64(file)
      if (!base64) {
        throw new CustomError(
          "Failed to upload file: file doesn't have any content",
          null,
        )
      }
      body = {
        base64,
        filename: file.name,
        mimeType: file.type,
      }

      const data = await fetchWithLogoutJson<{ url: string }>(url, {
        method: 'POST',
        body: JSON.stringify(body),
      })

      return data?.url as string
    } catch (err) {
      throw new CustomError('Failed to upload file', err, { file, url, body })
    }
  }
}
