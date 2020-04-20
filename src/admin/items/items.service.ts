import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './items.const';
import { GET_ITEM_BY_EXTERNAL_ID, GET_ITEM_BY_ID, GET_ITEMS, UPDATE_ITEM } from './items.gql';
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

	public static async fetchItems(
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
				query: GET_ITEMS,
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
				query: 'GET_ITEMS',
			});
		}
	}

	public static async fetchItem(id: string): Promise<Avo.Item.Item> {
		let variables: any;
		try {
			variables = {
				id,
			};
			const response = await dataService.query({
				variables,
				query: GET_ITEM_BY_ID,
			});
			const item = get(response, 'data.app_item_meta[0]');

			if (!item) {
				throw new CustomError('Response does not contain an item', null, {
					response,
				});
			}

			return item;
		} catch (err) {
			throw new CustomError('Failed to get the item from the database', err, {
				variables,
				query: 'GET_ITEM_BY_ID',
			});
		}
	}

	public static async fetchItemByExternalId(externalId: string): Promise<Avo.Item.Item> {
		let variables: any;
		try {
			variables = {
				externalId,
			};
			const response = await dataService.query({
				variables,
				query: GET_ITEM_BY_EXTERNAL_ID,
			});
			const item = get(response, 'data.app_item_meta[0]');

			if (!item) {
				throw new CustomError('Response does not contain an item', null, {
					response,
				});
			}

			return item;
		} catch (err) {
			throw new CustomError('Failed to get the item from the database', err, {
				variables,
				query: 'GET_ITEM_BY_EXTERNAL_ID',
			});
		}
	}

	static async setItemPublishedState(id: string, isPublished: boolean): Promise<void> {
		let variables: any;
		try {
			variables = {
				id,
				isPublished,
			};
			const response = await dataService.mutate({
				variables,
				mutation: UPDATE_ITEM,
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
					query: 'UPDATE_ITEM',
				}
			);
		}
	}
}
