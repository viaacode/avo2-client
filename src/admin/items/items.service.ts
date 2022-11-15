import { Avo } from '@viaa/avo2-types';
import { ItemSchema } from '@viaa/avo2-types/types/item';
import { compact, get } from 'lodash-es';
import queryString from 'query-string';

import { CustomError, getEnv, performQuery } from '../../shared/helpers';
import { addDefaultAudioStillToItem } from '../../shared/helpers/default-still';
import { fetchWithLogout } from '../../shared/helpers/fetch-with-logout';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { ApolloCacheManager, dataService } from '../../shared/services';
import { RelationService } from '../../shared/services/relation-service/relation.service';
import { UnpublishableItem } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './items.const';
import {
	DELETE_ITEM_FROM_COLLECTIONS_BOOKMARKS,
	FETCH_ITEM_UUID_BY_EXTERNAL_ID,
	GET_DISTINCT_SERIES,
	GET_ITEM_BY_UUID,
	GET_ITEM_DEPUBLISH_REASON,
	GET_ITEMS_BY_EXTERNAL_ID,
	GET_ITEMS_WITH_FILTERS,
	GET_PUBLIC_ITEMS,
	GET_PUBLIC_ITEMS_BY_TITLE_OR_EXTERNAL_ID,
	GET_UNPUBLISHED_ITEM_PIDS,
	GET_UNPUBLISHED_ITEMS_WITH_FILTERS,
	GET_USERS_WITH_EITHER_BOOKMARK,
	REPLACE_ITEM_IN_COLLECTIONS_BOOKMARKS_AND_ASSIGNMENTS,
	UPDATE_ITEM_DEPUBLISH_REASON,
	UPDATE_ITEM_NOTES,
	UPDATE_ITEM_PUBLISH_STATE,
	UPDATE_SHARED_ITEMS_STATUS,
} from './items.gql';
import {
	ItemsOverviewTableCols,
	UnpublishedItem,
	UnpublishedItemsOverviewTableCols,
} from './items.types';

export class ItemsService {
	public static async fetchItemsWithFilters(
		page: number,
		sortColumn: ItemsOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any
	): Promise<[Avo.Item.Item[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
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

	public static async fetchUnpublishedItemsWithFilters(
		page: number,
		sortColumn: UnpublishedItemsOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[UnpublishedItem[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: [{ [sortColumn]: sortOrder }],
			};

			const response = await dataService.query({
				variables,
				query: GET_UNPUBLISHED_ITEMS_WITH_FILTERS,
			});

			const items = get(response, 'data.shared_items');
			const itemCount = get(response, 'data.shared_items_aggregate.aggregate.count');

			if (!items) {
				throw new CustomError('Response does not contain any items', null, {
					response,
				});
			}

			return [items, itemCount];
		} catch (err) {
			throw new CustomError('Failed to get shared items from the database', err, {
				variables,
				query: 'GET_UNPUBLISHED_ITEMS_WITH_FILTERS',
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
				errorPolicy: 'all',
			});

			const rawItem = get(response, 'data.app_item_meta[0]');

			if (!rawItem) {
				throw new CustomError('Response does not contain an item', null, {
					response,
				});
			}

			return addDefaultAudioStillToItem(rawItem);
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
				throw new CustomError('Response from graphql contains errors', null, {
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

	static async setItemDepublishReason(itemUuid: string, reason: null | string): Promise<void> {
		let variables: any;
		try {
			variables = {
				itemUuid,
				reason,
			};
			const response = await dataService.mutate({
				variables,
				mutation: UPDATE_ITEM_DEPUBLISH_REASON,
			});

			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}
		} catch (err) {
			throw new CustomError(
				'Failed to update depublish_reason field for item in the database',
				err,
				{
					variables,
					query: 'UPDATE_ITEM_DEPUBLISH_REASON',
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
				throw new CustomError('Response from graphql contains errors', null, {
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

	public static async fetchPublicItems(limit?: number): Promise<Avo.Item.Item[] | null> {
		const query = {
			query: GET_PUBLIC_ITEMS,
			variables: { limit },
		};

		return performQuery(
			query,
			'data.app_item_meta',
			'Failed to retrieve items. GET_PUBLIC_ITEMS'
		);
	}

	private static async fetchDepublishReasonByExternalId(externalId: string): Promise<string> {
		const query = {
			query: GET_ITEM_DEPUBLISH_REASON,
			variables: { externalId },
		};

		return performQuery(
			query,
			'data.app_item_meta[0].depublish_reason',
			'Failed to retrieve depublish reason for item. GET_ITEM_DEPUBLISH_REASON'
		);
	}

	public static async fetchItemByExternalId(externalId: string): Promise<UnpublishableItem> {
		return (await this.fetchItemsByExternalIds([externalId]))[0] || null;
	}

	public static async fetchItemsByExternalIds(
		externalIds: string[]
	): Promise<Array<UnpublishableItem>> {
		if (externalIds.length < 1) {
			return [];
		}

		try {
			const response = await dataService.query({
				query: GET_ITEMS_BY_EXTERNAL_ID,
				variables: {
					externalIds,
				},
			});

			if (response.errors) {
				throw new CustomError('Response contains graphql errors', null, { response });
			}

			const items: ItemSchema[] = get(response, 'data.app_item_meta', []);

			return Promise.all(
				externalIds.map((externalId) => {
					// Return item if an item is found that is published and not deleted
					const item = items.find((item) => item.external_id === externalId);

					if (item) {
						return addDefaultAudioStillToItem(item) || null;
					}

					return this.fetchItemReplacementByExternalId(externalId);
				})
			);
		} catch (err) {
			throw new CustomError('Failed to get items by external id', err, {
				externalIds,
				query: 'GET_ITEMS_BY_EXTERNAL_ID',
			});
		}
	}

	public static async fetchItemReplacementByExternalId(
		externalId: string
	): Promise<UnpublishableItem> {
		// Return the replacement item if a REPLACED_BY relation is found for the current item
		// TODO replace with single query to fetch depublish_reason and relations after task is done: https://meemoo.atlassian.net/browse/DEV-1166
		const itemUid = await ItemsService.fetchItemUuidByExternalId(externalId);

		if (itemUid) {
			const relations = await RelationService.fetchRelationsBySubject(
				'item',
				[itemUid],
				'IS_REPLACED_BY'
			);

			const replacedByItemUid = get(relations, '[0].object', null);

			if (replacedByItemUid) {
				const replacementItem = await ItemsService.fetchItemByUuid(replacedByItemUid);
				return { ...replacementItem, replacement_for: externalId };
			}
		}

		// Return the depublish reason if the item has a depublish reason
		const depublishReason = await this.fetchDepublishReasonByExternalId(externalId);

		if (depublishReason) {
			return {
				depublish_reason: depublishReason,
			} as Avo.Item.Item;
		}

		// otherwise return null
		return null;
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
			return get(await response.json(), 'externalId') || null;
		} catch (err) {
			throw new CustomError('Failed to get external_id by mediamosa id (avo1 id)', err, {
				mediamosaId,
			});
		}
	}

	public static async fetchItemUuidByExternalId(externalId: string): Promise<string | null> {
		try {
			const response = await dataService.query({
				query: FETCH_ITEM_UUID_BY_EXTERNAL_ID,
				variables: { externalId },
			});

			if (response.errors) {
				if (response.errors[0].originalError?.message !== 'DEPUBLISH') {
					throw new CustomError('GraphQL response contains errors');
				}
			}

			return response?.data?.app_item_meta?.[0]?.uid || null;
		} catch (err) {
			throw new CustomError(
				'Failed to fetch item uuid by external id (FETCH_ITEM_UUID_BY_EXTERNAL_ID)',
				err
			);
		}
	}

	public static async fetchPublicItemsByTitleOrExternalId(
		titleOrExternalId: string,
		limit?: number
	): Promise<Avo.Item.Item[]> {
		try {
			const query = {
				query: GET_PUBLIC_ITEMS_BY_TITLE_OR_EXTERNAL_ID,
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
				query: 'GET_PUBLIC_ITEMS_BY_TITLE_OR_EXTERNAL_ID',
			});
		}
	}

	public static async fetchAllSeries(): Promise<string[]> {
		try {
			const response = await performQuery(
				{ query: GET_DISTINCT_SERIES },
				'data.app_item_meta',
				'Failed to retrieve distinct series'
			);

			return (response || []).map((item: { series: string }) => item.series);
		} catch (err) {
			throw new CustomError('Failed to fetch distinct series from the database', err, {
				query: 'GET_DISTINCT_SERIES',
			});
		}
	}

	public static async deleteItemFromCollectionsAndBookmarks(
		itemUid: string,
		itemExternalId: string
	) {
		try {
			const response = await dataService.mutate({
				mutation: DELETE_ITEM_FROM_COLLECTIONS_BOOKMARKS,
				variables: {
					itemUid,
					itemExternalId,
				},
				update: ApolloCacheManager.clearBookmarksViewsPlays,
			});

			if (response.errors) {
				throw new CustomError('graphql response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError(
				'Failed to delete item from collections and bookmarks in the database',
				err,
				{
					query: 'DELETE_ITEM_FROM_COLLECTIONS_BOOKMARKS',
				}
			);
		}
	}

	public static async replaceItemInCollectionsAndBookmarks(
		oldItemUid: string,
		oldItemExternalId: string,
		newItemUid: string,
		newItemExternalId: string
	) {
		try {
			const usersWithBothBookmarks = (
				(await performQuery(
					{
						query: GET_USERS_WITH_EITHER_BOOKMARK,
						variables: {
							oldItemUid,
							newItemUid,
						},
					},
					'data.users_profiles',
					'Failed while checking users with both bookmarks.'
				)) as (Pick<Avo.User.Profile, 'id'> & {
					item_bookmarks_aggregate: {
						aggregate: {
							count: number;
						};
					};
				})[]
			)
				.filter((result) => result.item_bookmarks_aggregate.aggregate.count >= 2)
				.map((profile) => profile.id);

			const response = await dataService.mutate({
				mutation: REPLACE_ITEM_IN_COLLECTIONS_BOOKMARKS_AND_ASSIGNMENTS,
				variables: {
					oldItemUid,
					oldItemExternalId,
					newItemUid,
					newItemExternalId,
					usersWithBothBookmarks,
				},
				update: ApolloCacheManager.clearBookmarksViewsPlays,
			});

			if (response.errors) {
				throw new CustomError('graphql response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError(
				'Failed to replace item in collections, bookmarks and assignments in the database',
				err,
				{
					query: 'REPLACE_ITEM_IN_COLLECTIONS_BOOKMARKS_AND_ASSIGNMENTS',
				}
			);
		}
	}

	public static async setSharedItemsStatus(pids: string[], status: string) {
		try {
			const response = await dataService.mutate({
				mutation: UPDATE_SHARED_ITEMS_STATUS,
				variables: {
					pids,
					status,
				},
				update: ApolloCacheManager.clearSharedItemsCache,
			});

			if (response.errors) {
				throw new CustomError('graphql response contains errors', null, { response });
			}
		} catch (err) {
			throw new CustomError('Failed to update status for shared items in the database', err, {
				query: 'UPDATE_SHARED_ITEMS_STATUS',
			});
		}
	}

	/**
	 * Returns result of request of MAM sync
	 * either:
	 * - started
	 * - running
	 */
	public static async triggerMamSync(): Promise<string> {
		let url: string | undefined = undefined;
		try {
			url = `${getEnv('PROXY_URL')}/mam-syncrator/trigger-delta-sync`;
			const response = await fetchWithLogout(url, {
				method: 'POST',
				credentials: 'include',
			});

			const body = await response.text();
			if (response.status < 200 || response.status >= 400) {
				throw new CustomError('Response code indicates failure', null, {
					response,
					body,
				});
			}
			return body;
		} catch (err) {
			throw new CustomError('Failed to trigger MAM sync', err, {
				url,
			});
		}
	}

	static async getUnpublishedItemPids(where: any = {}): Promise<string[]> {
		let variables: any;
		try {
			variables = where
				? {
						where,
				  }
				: {};
			const response = await dataService.query({
				variables,
				query: GET_UNPUBLISHED_ITEM_PIDS,
				fetchPolicy: 'no-cache',
			});
			if (response.errors) {
				throw new CustomError('Response from graphql contains errors', null, {
					response,
				});
			}
			return compact(
				get(response, 'data.shared_items' || []).map((item: { pid: string }) =>
					get(item, 'pid')
				)
			);
		} catch (err) {
			throw new CustomError('Failed to get unpublished item pids from the database', err, {
				variables,
				query: 'GET_UNPUBLISHED_ITEM_PIDS',
			});
		}
	}
}
