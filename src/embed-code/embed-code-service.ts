import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError, getEnv } from '../shared/helpers';
import { ITEMS_PER_PAGE } from '../workspace/workspace.const';

import { type EmbedCode } from './embed-code.types';

export interface EmbedCodeFilters {
	filterString?: string;
	sortColumn?: string;
	sortOrder?: Avo.Search.OrderDirection;
	limit: number;
	offset: number;
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
	public static async updateEmbedCode(data: EmbedCode): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${data.id}`;

			await fetchWithLogoutJson<{
				message: 'success';
			}>(url, {
				method: 'POST',
				body: JSON.stringify(data),
				forceLogout: false,
			});
		} catch (err) {
			throw new CustomError('Failed to create embed code', err, {
				url,
				data,
			});
		}
	}

	public static async getEmbedCodes(params?: EmbedCodeFilters): Promise<{
		embedCodes: EmbedCode[];
		count: number;
	}> {
		let url: string | undefined = undefined;

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
			});
			return fetchWithLogoutJson(url);
		} catch (err) {
			throw new CustomError('Failed to fetch embed codes from database', err, {
				...params,
				url,
			});
		}
	}

	public static async deleteEmbedCode(embedCodeId: string): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${embedCodeId}`;

			await fetchWithLogoutJson<{
				message: 'success';
			}>(url, {
				method: 'DELETE',
				forceLogout: false,
			});
		} catch (err) {
			throw new CustomError('Failed to delete embed code', err, {
				url,
				embedCodeId,
			});
		}
	}
}
