import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';

import { CustomError, getEnv } from '../helpers';

export type EmbedCodeContentType = 'ITEM' | 'COLLECTION' | 'ASSIGNMENT';

export interface EmbedCode {
	id: string;
	title: string;
	externalWebsite: EmbedCodeExternalWebsite;
	contentType: EmbedCodeContentType;
	contentId: string;
	content: Avo.Item.Item | Avo.Collection.Collection | Avo.Assignment.Assignment;
	descriptionType: EmbedCodeDescriptionType;
	description: string | null;
	owner: Avo.User.CommonUser;
	ownerProfileId: string;
	start: number | null;
	end: number | null;
	createdAt: string; // ISO datetime string
	updatedAt: string; // ISO datetime string
}

export enum EmbedCodeExternalWebsite {
	SMARTSCHOOL = 'SMARTSCHOOL',
	BOOKWIDGETS = 'BOOKWIDGETS',
}

export enum EmbedCodeDescriptionType {
	ORIGINAL = 'ORIGINAL',
	CUSTOM = 'CUSTOM',
	NONE = 'NONE',
}

export class EmbedCodeService {
	public static async createEmbedCode(data: EmbedCode): Promise<string> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/`;

			const response = await fetchWithLogoutJson<{
				message: 'success';
				createdEmbedCodeId: string;
			}>(url, {
				method: 'POST',
				body: JSON.stringify(data),
				forceLogout: false,
			});
			return response.createdEmbedCodeId;
		} catch (err) {
			throw new CustomError('Failed to create embed code', err, {
				url,
				data,
			});
		}
	}
}
