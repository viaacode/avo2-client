import { MutationFunction } from '@apollo/react-common';
import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError, performQuery } from '../../shared/helpers';
import { ApolloCacheManager, dataService, ToastService } from '../../shared/services';
import i18n from '../../shared/translations/i18n';
import {
	insertContentBlocks,
	updateContentBlocks,
} from '../content-block/services/content-block.service';
import { ContentBlockConfig } from '../shared/types';

import {
	CONTENT_RESULT_PATH,
	CONTENT_TYPES_LOOKUP_PATH,
	ITEMS_PER_PAGE,
	TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './content.const';
import {
	GET_CONTENT_BY_ID,
	GET_CONTENT_PAGES,
	GET_CONTENT_PAGES_BY_TITLE,
	GET_CONTENT_TYPES,
} from './content.gql';
import { ContentOverviewTableCols, ContentPageType } from './content.types';

export class ContentService {
	private static getOrderObject(
		sortColumn: ContentOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection
	) {
		const getOrderFunc: Function | undefined =
			TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT[sortColumn];
		if (getOrderFunc) {
			return [getOrderFunc(sortOrder)];
		}
		return [{ [sortColumn]: sortOrder }];
	}

	public static async fetchContentPages(
		page: number,
		sortColumn: ContentOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[Avo.Content.Content[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: ContentService.getOrderObject(sortColumn, sortOrder),
			};
			const response = await dataService.query({
				variables,
				query: GET_CONTENT_PAGES,
			});

			const contentPages: Avo.Content.Content[] | null = get(
				response,
				'data.app_content',
				[]
			);
			const contentPageCount: number = get(
				response,
				'data.app_content_aggregate.aggregate.count',
				0
			);

			if (!contentPages) {
				throw new CustomError('Response did not contain any content pages', null, {
					response,
				});
			}

			return [contentPages, contentPageCount];
		} catch (err) {
			throw new CustomError('Failed to get content pages from the database', err, {
				variables,
				query: 'GET_CONTENT_PAGES',
			});
		}
	}

	public static async getContentItems(limit: number): Promise<Avo.Content.Content[] | null> {
		const query = {
			query: GET_CONTENT_PAGES,
			variables: {
				limit,
				order: { title: 'asc' },
			},
		};

		return performQuery(
			query,
			`data.${CONTENT_RESULT_PATH.GET}`,
			'Failed to retrieve content items.',
			i18n.t(
				'admin/content/content___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-items'
			)
		);
	}

	public static async getContentItemsByTitle(
		title: string,
		limit: number
	): Promise<Avo.Content.Content[] | null> {
		const query = {
			query: GET_CONTENT_PAGES_BY_TITLE,
			variables: {
				title,
				limit,
				order: { title: 'asc' },
			},
		};

		return performQuery(
			query,
			`data.${CONTENT_RESULT_PATH.GET}`,
			'Failed to retrieve content items by title.',
			i18n.t(
				'admin/content/content___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-items'
			)
		);
	}

	public static async getContentItemById(id: number): Promise<Avo.Content.Content | null> {
		const query = {
			query: GET_CONTENT_BY_ID,
			variables: {
				id,
			},
		};

		return performQuery(
			query,
			`data.${CONTENT_RESULT_PATH.GET}[0]`,
			`Failed to retrieve content item by id: ${id}.`,
			i18n.t(
				'admin/content/content___er-ging-iets-mis-tijdens-het-ophalen-van-het-content-item'
			)
		);
	}

	public static async getContentTypes(): Promise<ContentPageType[] | null> {
		try {
			const response = await dataService.query({ query: GET_CONTENT_TYPES });
			return get(response, `data.${CONTENT_TYPES_LOOKUP_PATH}`, []).map(
				(obj: { value: ContentPageType }) => obj.value
			);
		} catch (err) {
			console.error('Failed to retrieve content types.', err);
			ToastService.danger(
				i18n.t(
					'admin/content/content___er-ging-iets-mis-tijdens-het-ophalen-van-de-content-types'
				),
				false
			);

			return null;
		}
	}

	public static async insertContent(
		contentItem: Partial<Avo.Content.Content>,
		contentBlockConfigs: ContentBlockConfig[],
		triggerContentInsert: MutationFunction<Partial<Avo.Content.Content>>
	): Promise<Partial<Avo.Content.Content> | null> {
		try {
			const response = await triggerContentInsert({
				variables: { contentItem },
				update: ApolloCacheManager.clearContentCache,
			});
			const id: number | null = get(
				response,
				`data.${CONTENT_RESULT_PATH.INSERT}.returning[0].id`,
				null
			);

			if (id) {
				// Insert content-blocks
				if (contentBlockConfigs && contentBlockConfigs.length) {
					const contentBlocks = await insertContentBlocks(id, contentBlockConfigs);

					if (!contentBlocks) {
						// return null to prevent triggering success toast
						return null;
					}
				}

				return { ...contentItem, id } as Partial<Avo.Content.Content>;
			}

			return null;
		} catch (err) {
			console.error('Failed to insert content blocks', err);
			ToastService.danger(
				i18n.t(
					'admin/content/content___er-ging-iets-mis-tijdens-het-opslaan-van-de-content'
				),
				false
			);

			return null;
		}
	}

	public static async updateContent(
		contentItem: Partial<Avo.Content.Content>,
		initialContentBlocks: Avo.ContentBlocks.ContentBlocks[],
		contentBlockConfigs: ContentBlockConfig[],
		triggerContentUpdate: MutationFunction<Partial<Avo.Content.Content>>
	): Promise<Partial<Avo.Content.Content> | null> {
		try {
			const response = await triggerContentUpdate({
				variables: {
					contentItem,
					id: contentItem.id,
				},
				update: ApolloCacheManager.clearContentCache,
			});
			const updatedContent = get(response, 'data', null);

			if (contentBlockConfigs && contentBlockConfigs.length) {
				await updateContentBlocks(
					contentItem.id as number,
					initialContentBlocks,
					contentBlockConfigs
				);
			}

			if (!updatedContent) {
				throw new CustomError('Content update returned empty response', null, response);
			}

			return contentItem;
		} catch (err) {
			console.error('Failed to save content', err);
			ToastService.danger(
				i18n.t(
					'admin/content/content___er-ging-iets-mis-tijdens-het-opslaan-van-de-content'
				),
				false
			);

			return null;
		}
	}
}
