import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { stringifyUrl } from 'query-string';

import { CustomError, getEnv } from '../helpers';

export interface KlascementPublishCollectionData {
	collectionId: string;
	imageUrl: string;
	altText: string;
	sourceText: string;
}

export interface KlascementPublishAssignmentData {
	assignmentId: string;
	imageUrl: string;
	altText: string;
	sourceText: string;
}

export interface KlascementPublishCollectionResponse {
	message: 'success';
	createdCollectionId: number;
}

export interface KlascementPublishAssignmentResponse {
	message: 'success';
	createdAssignmentId: number;
}

export interface KlascementPublishInfo {
	id: string;
	alt_text: string;
	image_url: string;
	source_text: string;
	klascement_id: number | null;
}

export class KlascementService {
	public static async getKlascementPublishInfoForCollection(
		collectionId: string
	): Promise<KlascementPublishInfo | null> {
		try {
			const url = stringifyUrl({
				url: `${getEnv('PROXY_URL')}/klascement/collection`,
				query: { collectionId },
			});
			return await fetchWithLogoutJson(url);
		} catch (err) {
			throw new CustomError(
				'Failed to get klascement publish information for collection',
				err,
				{
					collectionId,
				}
			);
		}
	}

	public static async publishCollection(data: KlascementPublishCollectionData): Promise<number> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/klascement/publish/collection`;

			const response = await fetchWithLogoutJson<KlascementPublishCollectionResponse>(url, {
				method: 'POST',
				body: JSON.stringify(data),
				forceLogout: false,
			});
			return response.createdCollectionId;
		} catch (err) {
			throw new CustomError('Failed to publish collection to Klascement', err, {
				url,
				data,
			});
		}
	}

	public static async publishAssignment(data: KlascementPublishAssignmentData): Promise<number> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/klascement/publish/assignment`;

			const response = await fetchWithLogoutJson<KlascementPublishAssignmentResponse>(url, {
				method: 'POST',
				body: JSON.stringify(data),
				forceLogout: false,
			});
			return response.createdAssignmentId;
		} catch (err) {
			throw new CustomError('Failed to publish assignment to Klascement', err, {
				url,
				data,
			});
		}
	}
}
