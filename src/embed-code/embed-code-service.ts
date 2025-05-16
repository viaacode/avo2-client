import { fetchWithLogoutJson } from '@meemoo/admin-core-ui/dist/client.mjs';
import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { CustomError } from '../shared/helpers/custom-error';
import { getEnv } from '../shared/helpers/env';
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
	public static async getEmbedCode(embedId: string): Promise<EmbedCode> {
		let url: string | undefined = undefined;

		if (!embedId) {
			const error = new CustomError('Failed to get embed code when embedId is empty', {
				url,
			});
			console.log(error);
			throw error;
		}

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${embedId}`;

			return fetchWithLogoutJson<EmbedCode>(url, {
				method: 'GET',
				forceLogout: false,
			});
		} catch (err) {
			const error = new CustomError('Failed to get embed code', err, {
				url,
			});
			console.log(error);
			throw error;
		}
	}

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
			const error = new CustomError('Failed to create embed code', err, {
				url,
				data,
			});
			console.log(error);
			throw error;
		}
	}

	public static async updateEmbedCode(data: EmbedCode): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${data.id}`;

			await fetchWithLogoutJson<{
				message: 'success';
			}>(url, {
				method: 'PATCH',
				body: JSON.stringify(data),
				forceLogout: false,
			});
		} catch (err) {
			const error = new CustomError('Failed to create embed code', err, {
				url,
				data,
			});
			console.log(error);
			throw error;
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
			const error = new CustomError('Failed to fetch embed codes from database', err, {
				...params,
				url,
			});
			console.log(error);
			throw error;
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
			const error = new CustomError('Failed to delete embed code', err, {
				url,
				embedCodeId,
			});
			console.log(error);
			throw error;
		}
	}
}
