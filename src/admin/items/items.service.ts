import { get } from 'lodash-es';
import queryString from 'query-string';

import { Avo } from '@viaa/avo2-types';

import { CustomError, getEnv, performQuery } from '../../shared/helpers';
import { addDefaultAudioStillToItem } from '../../shared/helpers/default-still';
import { fetchWithLogout } from '../../shared/helpers/fetch-with-logout';
import { dataService } from '../../shared/services';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './items.const';
import {
	GET_ITEM_BY_EXTERNAL_ID,
	GET_ITEM_BY_UUID,
	GET_ITEMS,
	GET_ITEMS_BY_TITLE_OR_EXTERNAL_ID,
	GET_ITEMS_WITH_FILTERS,
	UPDATE_ITEM_NOTES,
	UPDATE_ITEM_PUBLISH_STATE,
} from './items.gql';
import { ItemsOverviewTableCols } from './items.types';

export class ItemsService {
	private static getOrderObject(
		sortColumn: ItemsOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection
	) {
		const getOrderFunc: Function | undefined =
			TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT[sortColumn];

		if (getOrderFunc) {
			return [getOrderFunc(sortOrder)];
		}

		return [{ [sortColumn]: sortOrder }];
	}

	public static async fetchItemsWithFilters(
		page: number,
		sortColumn: ItemsOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[Avo.Item.Item[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: ItemsService.getOrderObject(sortColumn, sortOrder),
			};

			const response = await dataService.query({
				variables,
				query: GET_ITEMS_WITH_FILTERS,
			});

			const items = get(response, 'data.app_item_meta');
			const itemCount = get(response, 'data.app_item_meta_aggregate.aggregate.count');

			if (!items) {
				throw new CustomError('Response does not contain any items', null, {
					response,
				});
			}

			return [items, itemCount];
		} catch (err) {
			throw new CustomError('Failed to get items from the database', err, {
				variables,
				query: 'GET_ITEMS_WITH_FILTERS',
			});
		}
	}

	public static async fetchItemByUuid(uuid: string): Promise<Avo.Item.Item> {
		let variables: any;
		try {
			variables = {
				uuid,
			};

			const response = await dataService.query({
				variables,
				query: GET_ITEM_BY_UUID,
			});

			const rawItem = get(response, 'data.app_item_meta[0]');

			if (!rawItem) {
				throw new CustomError('Response does not contain an item', null, {
					response,
				});
			}

			const item = addDefaultAudioStillToItem(rawItem);

			return item;
		} catch (err) {
			throw new CustomError('Failed to get the item from the database', err, {
				variables,
				query: 'GET_ITEM_BY_UUID',
			});
		}
	}

	static async setItemPublishedState(itemUuid: string, isPublished: boolean): Promise<void> {
		let variables: any;
		try {
			variables = {
				itemUuid,
				isPublished,
			};
			const response = await dataService.mutate({
				variables,
				mutation: UPDATE_ITEM_PUBLISH_STATE,
			});

			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}
		} catch (err) {
			throw new CustomError(
				'Failed to update is_published field for item in the database',
				err,
				{
					variables,
					query: 'UPDATE_ITEM_PUBLISH_STATE',
				}
			);
		}
	}

	static async setItemNotes(itemUuid: string, note: string | null): Promise<void> {
		let variables: any;
		try {
			variables = {
				itemUuid,
				note,
			};
			const response = await dataService.mutate({
				variables,
				mutation: UPDATE_ITEM_NOTES,
			});

			if (response.errors) {
				throw new CustomError('Response from gragpql contains errors', null, {
					response,
				});
			}
		} catch (err) {
			throw new CustomError('Failed to update note field for item in the database', err, {
				variables,
				query: 'UPDATE_ITEM_NOTES',
			});
		}
	}

	public static async fetchItems(limit?: number): Promise<Avo.Item.Item[] | null> {
		const query = {
			query: GET_ITEMS,
			variables: { limit },
		};

		return performQuery(query, 'data.app_item_meta', 'Failed to retrieve items.');
	}

	public static async fetchItemByExternalId(externalId: string): Promise<Avo.Item.Item | null> {
		try {
			const response = await dataService.query({
				query: GET_ITEM_BY_EXTERNAL_ID,
				variables: {
					externalId,
				},
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const item = addDefaultAudioStillToItem(get(response, 'data.app_item_meta[0]')) || null;

			return item;
		} catch (err) {
			throw new CustomError('Failed to get item by external id', err, {
				externalId,
				query: 'GET_ITEM_BY_EXTERNAL_ID',
			});
		}
	}

	public static async fetchItemExternalIdByMediamosaId(
		mediamosaId: string
	): Promise<string | null> {
		try {
			const response = await fetchWithLogout(
				`${getEnv(
					'PROXY_URL'
				)}/collections/fetch-external-id-by-mediamosa-id?${queryString.stringify({
					id: mediamosaId,
				})}`,
				{
					method: 'GET',
					headers: {
						'Content-Type': 'application/json',
					},
					credentials: 'include',
				}
			);
			if (response.status < 200 || response.status >= 400) {
				throw new CustomError(
					'Failed to get external_id from /collections/fetch-external-id-by-mediamosa-id',
					null,
					{
						response,
					}
				);
			}
			return get(response.json(), 'externalId') || null;
		} catch (err) {
			throw new CustomError('Failed to get external_id by mediamosa id (avo1 id)', err, {
				mediamosaId,
			});
		}
	}

	public static async fetchItemsByTitleOrExternalId(
		titleOrExternalId: string,
		limit?: number
	): Promise<Avo.Item.Item[]> {
		try {
			const query = {
				query: GET_ITEMS_BY_TITLE_OR_EXTERNAL_ID,
				variables: {
					limit,
					title: `%${titleOrExternalId}%`,
					externalId: titleOrExternalId,
				},
			};

			const response = await performQuery(
				query,
				'data',
				'Failed to retrieve items by title or external id.'
			);

			let items = get(response, 'itemsByExternalId', []);

			if (items.length === 0) {
				items = get(response, 'itemsByTitle', []);
			}

			return items;
		} catch (err) {
			throw new CustomError('Failed to fetch items by title or external id', err, {
				titleOrExternalId,
				limit,
			});
		}
	}
}
