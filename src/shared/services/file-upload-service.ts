import { CustomError, getEnv } from '../helpers';

export type AssetType =
	| 'BUNDLE_COVER'
	| 'COLLECTION_COVER'
	| 'CONTENT_PAGE_IMAGE'
	| 'PROFILE_AVATAR'
	| 'ITEM_SUBTITLE';

export interface UploadAssetInfo {
	// TODO use typings version
	filename: string;
	content: string;
	mimeType: string;
	type: AssetType; // Used to put the asset inside a folder structure inside the bucket
	ownerId: string;
}

export interface AssetInfo {
	// TODO use typings version
	url: string;
	id: string;
	type: AssetType; // enum in the database
	objectId: string | number;
}

function fileToBase64(file: File): Promise<string | null> {
	return new Promise((resolve, reject) => {
		const reader = new FileReader();
		reader.readAsDataURL(file);
		reader.onload = () => resolve(reader.result ? reader.result.toString() : null);
		reader.onerror = error => reject(error);
	});
}

export const uploadFile = async (
	file: File,
	assetType: AssetType,
	ownerId: string
): Promise<string | null> => {
	let url: string | undefined = undefined;
	let body: UploadAssetInfo | undefined = undefined;
	try {
		url = `${getEnv('PROXY_URL')}/assets/upload`;
		const content = await fileToBase64(file);
		if (!content) {
			return null;
		}
		body = {
			content,
			ownerId,
			filename: file.name,
			mimeType: file.type,
			type: assetType,
		};

		const response = await fetch(url, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(body),
		});

		const data: AssetInfo = await response.json();
		return data.url;
	} catch (err) {
		throw new CustomError('Failed to upload file', err, { file, url, body });
	}
};

export const deleteFile = async (fileUrl: string): Promise<void> => {
	let url: string | undefined = undefined;
	let body: any;
	try {
		url = `${getEnv('PROXY_URL')}/assets/delete`;

		body = {
			url: fileUrl,
		};

		const response = await fetch(url, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json',
			},
			credentials: 'include',
			body: JSON.stringify(body),
		});

		if (response.status < 200 || response.status >= 400) {
			throw new CustomError('Response status is not in the success range', null, { response });
		}

		const reply = await response.json();
		if (!reply || reply.status !== 'deleted') {
			throw new CustomError(
				'Unexpected response from assets/delete endpoint. Expected {status: deleted}',
				null,
				{ reply, response }
			);
		}
		return;
	} catch (err) {
		throw new CustomError('Failed to upload file', err, { fileUrl, url, body });
	}
};
