import type { Avo } from '@viaa/avo2-types';
import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';

import { CustomError, getEnv } from '../helpers';

export class FileUploadService {
	private static fileToBase64(file: File): Promise<string | null> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.readAsDataURL(file);
			reader.onload = () => resolve(reader.result ? reader.result.toString() : null);
			reader.onerror = (error) => reject(error);
		});
	}

	public static async uploadFile(
		file: File,
		assetType: Avo.FileUpload.AssetType,
		ownerId: string
	): Promise<string> {
		if (assetType === 'ZENDESK_ATTACHMENT') {
			return await FileUploadService.uploadFileToZendesk(file);
		}
		return await FileUploadService.uploadFileToBlobStorage(file, assetType, ownerId);
	}

	public static async uploadFileToZendesk(file: File): Promise<string> {
		let url: string | undefined;
		let body: Avo.FileUpload.ZendeskFileInfo | undefined;
		try {
			url = `${getEnv('PROXY_URL')}/zendesk/upload-attachment`;
			const base64 = await this.fileToBase64(file);
			if (!base64) {
				throw new CustomError("Failed to upload file: file doesn't have any content", null);
			}
			body = {
				base64,
				filename: file.name,
				mimeType: file.type,
			};

			const data = await fetchWithLogoutJson(url, {
				method: 'POST',
				body: JSON.stringify(body),
			});

			return data?.url as string;
		} catch (err) {
			throw new CustomError('Failed to upload file', err, { file, url, body });
		}
	}

	public static async uploadFileToBlobStorage(
		file: File,
		assetType: Avo.FileUpload.AssetType,
		ownerId: string
	): Promise<string> {
		let url: string | undefined;
		try {
			url = `${getEnv('PROXY_URL')}/assets/upload`;

			const formData = new FormData();
			formData.append('ownerId', ownerId);
			formData.append('filename', file.name);
			formData.append('mimeType', file.type);
			formData.append('type', assetType as any);
			formData.append('content', file, file.name);

			const data = await fetchWithLogoutJson<Avo.FileUpload.AssetInfo>(url, {
				method: 'POST',
				headers: {
					// 'content-type': 'multipart/form-data',
				},
				body: formData,
			});

			return data?.url as string;
		} catch (err) {
			throw new CustomError('Failed to upload file', err, { file, url });
		}
	}

	public static async deleteFile(fileUrl: string): Promise<void> {
		let url: string | undefined;
		let body: any;
		try {
			url = `${getEnv('PROXY_URL')}/assets/delete`;

			body = {
				url: fileUrl,
			};

			const reply = await fetchWithLogoutJson(url, {
				method: 'DELETE',
				body: JSON.stringify(body),
			});

			if (!reply || reply.status !== 'deleted') {
				throw new CustomError(
					'Unexpected response from assets/delete endpoint. Expected {status: deleted}',
					null,
					{ reply, fileUrl }
				);
			}
			return;
		} catch (err) {
			throw new CustomError('Failed to upload file', err, { fileUrl, url, body });
		}
	}
}
