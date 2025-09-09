import { stringifyUrl } from 'query-string';

import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';

import { ITEMS_PER_PAGE } from './redirect-detail.const';
import { type RedirectDetail, type RedirectDetailFilters } from './redirect-detail.types';

export class RedirectDetailService {
	public static async fetchRedirectDetails(params: RedirectDetailFilters): Promise<{
		redirectDetails: RedirectDetail[];
		count: number;
	}> {
		let url: string | undefined = undefined;

		try {
			url = stringifyUrl({
				url: `${getEnv('PROXY_URL')}/redirect-details`,
				query: {
					sortColumn: params?.sortColumn,
					sortOrder: params?.sortOrder,
					offset: params?.offset,
					limit: params?.limit || ITEMS_PER_PAGE,
					filters: JSON.stringify(params),
				},
			});

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return await fetchWithLogoutJson<{
				redirectDetails: RedirectDetail[];
				count: number;
			}>(url, {
				method: 'GET',
			});
		} catch (err) {
			const error = new CustomError('Failed to fetch redirect details from database', err, {
				...params,
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async fetchRedirectDetail(redirectDetailId: number): Promise<RedirectDetail> {
		let url: string | undefined = undefined;
		const errorMessage: string | undefined = undefined;

		if (!redirectDetailId) {
			const error = new CustomError(
				'Failed to get redirect detail when redirectDetailId is empty',
				{
					url,
				}
			);
			console.error(error);
			throw error;
		}

		try {
			url = `${getEnv('PROXY_URL')}/redirect-details/${redirectDetailId}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return await fetchWithLogoutJson<RedirectDetail>(url, {
				method: 'GET',
			});
		} catch (err) {
			const error = new CustomError('Failed to get redirect', err, {
				url,
				errorMessage,
			});
			console.error(error);
			throw error;
		}
	}

	public static async insertRedirectDetail(
		redirectDetail: RedirectDetail
	): Promise<RedirectDetail> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/redirect-details/`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			const responseData = await fetchWithLogoutJson<{
				message: 'success';
				createdRedirectDetail: RedirectDetail;
			}>(url, {
				method: 'POST',
				body: JSON.stringify(redirectDetail),
			});

			return responseData.createdRedirectDetail;
		} catch (err) {
			const error = new CustomError('Failed to create redirectDetail', err, {
				url,
				redirectDetail,
				errorMessage: (err as CustomError)?.additionalInfo?.responseBody?.additionalInfo
					?.message,
			});
			console.error(error);
			throw error;
		}
	}

	static async updateRedirectDetail(redirectDetail: RedirectDetail): Promise<number> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/redirect-details/${redirectDetail.id}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			await fetchWithLogoutJson<{
				message: 'success';
			}>(url, {
				method: 'PATCH',
				body: JSON.stringify(redirectDetail),
			});
			return redirectDetail.id;
		} catch (err) {
			const error = new CustomError('Failed to update redirectDetail', err, {
				url,
				redirectDetail,
				errorMessage: (err as CustomError)?.additionalInfo?.responseBody?.additionalInfo
					?.message,
			});
			console.error(error);
			throw error;
		}
	}

	static async deleteRedirectDetail(redirectDetailId: number): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/redirect-details/${redirectDetailId}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			await fetchWithLogoutJson<{
				message: 'success';
			}>(url, {
				method: 'DELETE',
			});
		} catch (err) {
			const error = new CustomError('Failed to delete redirect detail', err, {
				url,
				redirectDetailId,
			});
			console.error(error);
			throw error;
		}
	}
}
