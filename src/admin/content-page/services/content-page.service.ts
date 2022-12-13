import {
	AdminConfigManager,
	ContentPageInfo,
	convertDbContentPagesToContentPageInfos,
	convertDbContentPageToContentPageInfo,
	DbContentPage,
	fetchWithLogoutJson,
} from '@meemoo/admin-core-ui';
import { ButtonAction } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { stringifyUrl } from 'query-string';

import { ResolvedItemOrCollection } from '../../../search/components/MediaGridWrapper/MediaGridWrapper.types';
import { CustomError, getEnv } from '../../../shared/helpers';
import { ContentPageLabel } from '../../content-page-labels/content-page-label.types';

import { CONTENT_PAGE_SERVICE_BASE_URL } from './content-page.const';

export class ContentPageService {
	private static getBaseUrl(): string {
		return `${
			AdminConfigManager.getConfig().database.proxyUrl
		}${CONTENT_PAGE_SERVICE_BASE_URL}`;
	}

	public static async getPublicContentItems(limit: number): Promise<ContentPageInfo[] | null> {
		const dbContentPages: DbContentPage[] = await fetchWithLogoutJson(
			stringifyUrl({
				url: `${this.getBaseUrl()}/public`,
				query: {
					limit,
				},
			})
		);
		return convertDbContentPagesToContentPageInfos(dbContentPages);
	}

	public static async getPublicProjectContentItems(limit: number): Promise<ContentPageInfo[]> {
		const dbContentPages: DbContentPage[] = await fetchWithLogoutJson(
			stringifyUrl({
				url: `${this.getBaseUrl()}/projects/public`,
				query: {
					limit,
				},
			})
		);
		return convertDbContentPagesToContentPageInfos(dbContentPages) || [];
	}

	public static async getPublicContentItemsByTitle(
		title: string,
		limit?: number
	): Promise<ContentPageInfo[]> {
		const dbContentPages: DbContentPage[] = await fetchWithLogoutJson(
			stringifyUrl({
				url: `${this.getBaseUrl()}/public`,
				query: {
					limit,
					title,
				},
			})
		);
		return convertDbContentPagesToContentPageInfos(dbContentPages) || [];
	}

	public static async getPublicProjectContentItemsByTitle(
		title: string,
		limit: number
	): Promise<Partial<ContentPageInfo>[]> {
		const dbContentPages: DbContentPage[] | null = await fetchWithLogoutJson(
			stringifyUrl({
				url: `${this.getBaseUrl()}/projects/public`,
				query: {
					limit,
					title,
				},
			})
		);
		return convertDbContentPagesToContentPageInfos(dbContentPages) || [];
	}

	public static async getContentTypes(): Promise<
		{ value: Avo.ContentPage.Type; label: string }[] | null
	> {
		return fetchWithLogoutJson(`${this.getBaseUrl()}/types`);
	}

	public static async fetchLabelsByContentType(contentType: string): Promise<ContentPageLabel[]> {
		return (
			(await fetchWithLogoutJson(
				stringifyUrl({
					url: `${this.getBaseUrl()}/labels`,
					query: {
						contentType,
					},
				})
			)) || []
		);
	}

	/**
	 * Get a content page with all of its content without the user having to be logged in
	 * @param path The path to identify the content page including the leading slash. eg: /over
	 */
	public static async getContentPageByPath(path: string): Promise<ContentPageInfo | null> {
		try {
			const dbContentPage = await fetchWithLogoutJson<DbContentPage | null>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/content-pages`,
					query: {
						path,
					},
				}),
				{
					throwOnNull: false,
				}
			);
			return convertDbContentPageToContentPageInfo(dbContentPage);
		} catch (err) {
			throw new CustomError('Failed to get content page by path', err);
		}
	}

	public static async resolveMediaItems(
		searchQuery: string | null,
		searchQueryLimit: number | undefined,
		mediaItems:
			| {
					mediaItem: ButtonAction;
			  }[]
			| undefined
	): Promise<ResolvedItemOrCollection[]> {
		let url: string | undefined = undefined;
		let body: any | undefined = undefined;
		try {
			url = AdminConfigManager.getConfig().database.proxyUrl + '/content-pages/media';
			body = {
				searchQuery,
				searchQueryLimit,
				mediaItems,
			};
			return fetchWithLogoutJson(url, {
				method: 'POST',
				body: JSON.stringify(body),
			});
		} catch (err) {
			throw new CustomError('Failed to resolve media items through proxy', err, {
				searchQuery,
				searchQueryLimit,
				mediaItems,
				url,
				body,
			});
		}
	}
}
