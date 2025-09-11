import { stringifyUrl } from 'query-string';

import { CustomError } from '../../shared/helpers/custom-error';
import { getEnv } from '../../shared/helpers/env';

import { replaceProxyUrlTemplateWithUrl } from './helpers/replace-proxy-url-template-with-url';
import { ITEMS_PER_PAGE } from './url-redirects.const';
import { type UrlRedirect, type UrlRedirectFilters } from './url-redirects.types';

export class UrlRedirectsService {
	public static async fetchUrlRedirectMap(): Promise<{ [avo1Path: string]: string }> {
		const url = `${getEnv('PROXY_URL')}/url-redirects/map`;

		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			const urlRedirects = await fetchWithLogoutJson<{ [avo1Path: string]: string }>(url);

			return Object.fromEntries(
				Object.entries(urlRedirects).map((mapping) => [
					mapping[0],
					replaceProxyUrlTemplateWithUrl(mapping[1]),
				])
			);
		} catch (err) {
			const error = new CustomError('Failed to fetch url redirects from database', err, {
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async fetchUrlRedirectsOverview(params: UrlRedirectFilters): Promise<{
		urlRedirects: UrlRedirect[];
		count: number;
	}> {
		let url: string | undefined = undefined;

		try {
			url = stringifyUrl({
				url: `${getEnv('PROXY_URL')}/url-redirects`,
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
				urlRedirects: UrlRedirect[];
				count: number;
			}>(url);
		} catch (err) {
			const error = new CustomError('Failed to fetch url redirects from database', err, {
				...params,
				url,
			});
			console.error(error);
			throw error;
		}
	}

	public static async fetchSingleUrlRedirect(urlRedirectId: number): Promise<UrlRedirect> {
		let url: string | undefined = undefined;
		const errorMessage: string | undefined = undefined;

		if (!urlRedirectId) {
			const error = new CustomError(
				'Failed to get url redirect when urlRedirectId is empty',
				{
					url,
				}
			);
			console.error(error);
			throw error;
		}

		try {
			url = `${getEnv('PROXY_URL')}/url-redirects/${urlRedirectId}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return await fetchWithLogoutJson<UrlRedirect>(url);
		} catch (err) {
			const error = new CustomError('Failed to get url redirect', err, {
				url,
				errorMessage,
			});
			console.error(error);
			throw error;
		}
	}

	public static async insertUrlRedirect(urlRedirect: UrlRedirect): Promise<UrlRedirect> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/url-redirects/`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			const responseData = await fetchWithLogoutJson<{
				message: 'success';
				createdUrlRedirect: UrlRedirect;
			}>(url, {
				method: 'POST',
				body: JSON.stringify(urlRedirect),
			});

			return responseData.createdUrlRedirect;
		} catch (err) {
			const error = new CustomError('Failed to create url redirect', err, {
				url,
				urlRedirect,
				errorMessage: (err as CustomError)?.additionalInfo?.responseBody?.additionalInfo
					?.message,
			});
			console.error(error);
			throw error;
		}
	}

	static async updateUrlRedirect(urlRedirect: UrlRedirect): Promise<UrlRedirect> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/url-redirects/${urlRedirect.id}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			return await fetchWithLogoutJson<UrlRedirect>(url, {
				method: 'PATCH',
				body: JSON.stringify(urlRedirect),
			});
		} catch (err) {
			const error = new CustomError('Failed to update url redirect', err, {
				url,
				urlRedirect,
				errorMessage: (err as CustomError)?.additionalInfo?.responseBody?.additionalInfo
					?.message,
			});
			console.error(error);
			throw error;
		}
	}

	static async deleteUrlRedirect(urlRedirectId: number): Promise<void> {
		let url: string | undefined = undefined;

		try {
			url = `${getEnv('PROXY_URL')}/url-redirects/${urlRedirectId}`;

			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/dist/client.mjs');
			await fetchWithLogoutJson<{
				message: 'success';
			}>(url, {
				method: 'DELETE',
			});
		} catch (err) {
			const error = new CustomError('Failed to delete url redirect', err, {
				url,
				urlRedirectId,
			});
			console.error(error);
			throw error;
		}
	}
}
