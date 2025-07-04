import { type Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { LTI_JWT_TOKEN_HEADER } from '../embed/embed.types';
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
	public static async getEmbedCode(embedId: string | null): Promise<EmbedCode> {
		let url: string | undefined = undefined;

		if (!embedId) {
			const error = new CustomError('Failed to get embed code when embedId is empty', {
				url,
			});
			console.error(error);
			throw error;
		}

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${embedId}`;

			// Using a regular fetch since we use this method for AVO and the embed iframe
			// For the iframe we need to add extra headers since the authentication goes via the LTI flow and our fetchWithLogoutJson will get in the way
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					[LTI_JWT_TOKEN_HEADER]: EmbedCodeService.getJwtTokenFromUrl() || '',
				},
				credentials: 'include',
			});

			if (!response.ok) {
				const error = new CustomError('Failed to get embed code', {
					url,
				});
				throw error;
			}

			return (await response.json()) as EmbedCode;
		} catch (err) {
			const error = new CustomError('Failed to get embed code', err, {
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async createEmbedCode(data: EmbedCode): Promise<EmbedCode> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			const responseData = await fetchWithLogoutJson<{
				message: 'success';
				createdEmbed: EmbedCode;
			}>(url, {
				method: 'POST',
				body: JSON.stringify(data),
			});

			return responseData.createdEmbed;
		} catch (err) {
			const error = new CustomError('Failed to create embed code', err, {
				url,
				data,
			});
			console.error(error);
			throw error;
		}
	}

	public static async updateEmbedCode(data: EmbedCode): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${data.id}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			await fetchWithLogoutJson<{
				message: 'success';
				createdEmbed: EmbedCode;
			}>(url, {
				method: 'PATCH',
				body: JSON.stringify(data),
			});
		} catch (err) {
			const error = new CustomError('Failed to create embed code', err, {
				url,
				data,
			});
			console.error(error);
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

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return await fetchWithLogoutJson<{
				embedCodes: EmbedCode[];
				count: number;
			}>(url, {
				method: 'GET',
			});
		} catch (err) {
			const error = new CustomError('Failed to fetch embed codes from database', err, {
				...params,
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async deleteEmbedCode(embedCodeId: string): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${embedCodeId}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			await fetchWithLogoutJson<{
				message: 'success';
				createdEmbed: EmbedCode;
			}>(url, {
				method: 'DELETE',
			});
		} catch (err) {
			const error = new CustomError('Failed to delete embed code', err, {
				url,
				embedCodeId,
			});
			console.error(error);
			throw error;
		}
	}

	/**
	 * Embed codes inside an iframe will have a query param: jwtToken containing a token to authenticate api requests
	 * After the user has logged in, or when the external platform has provided enough info to log in the user through the LTI login flow
	 * @private
	 */
	public static getJwtTokenFromUrl(): string | null {
		const urlParams = new URLSearchParams(window.location.search);
		return urlParams.get('jwtToken');
	}
}
