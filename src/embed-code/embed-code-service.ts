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
			console.error(error);
			throw error;
		}

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/${embedId}`;

			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
					authorization: `Bearer ${EmbedCodeService.getJwtTokenFromUrl()}`,
				},
				credentials: 'include',
			});
			const embedCode = await response.json();
			return embedCode as EmbedCode;
		} catch (err) {
			const error = new CustomError('Failed to get embed code', err, {
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async createEmbedCode(data: EmbedCode): Promise<string> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/embed-codes/`;

			const response = await fetch(url, {
				method: 'POST',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});
			if (!response.ok) {
				const error = new CustomError('Failed to create embed code', {
					url,
					data,
				});
				console.error(error);
				throw error;
			}
			const responseData = (await response.json()) as {
				message: 'success';
				createdEmbedCodeId: string;
			};

			return responseData.createdEmbedCodeId;
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

			const response = await fetch(url, {
				method: 'PATCH',
				body: JSON.stringify(data),
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});
			if (!response.ok) {
				const error = new CustomError('Failed to update embed code', null, {
					url,
					data,
				});
				console.error(error);
				throw error;
			}
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
			const response = await fetch(url, {
				method: 'GET',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});
			if (!response.ok) {
				const error = new CustomError('Failed to fetch embed codes from database', null, {
					url,
					...params,
				});
				console.error(error);
				throw error;
			}
			const responseData = (await response.json()) as {
				embedCodes: EmbedCode[];
				count: number;
			};
			return responseData;
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

			const response = await fetch(url, {
				method: 'DELETE',
				headers: {
					'Content-Type': 'application/json',
				},
				credentials: 'include',
			});
			if (!response.ok) {
				const error = new CustomError('Failed to delete embed code', null, {
					url,
					embedCodeId,
				});
				console.error(error);
				throw error;
			}
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
