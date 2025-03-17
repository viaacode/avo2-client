import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';

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

export class KlascementService {
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
