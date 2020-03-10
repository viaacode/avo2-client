import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services';

import { ITEMS_PER_PAGE, TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT } from './items.const';
import { GET_ITEMS } from './items.gql';
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
		} else {
			return [{ [sortColumn]: sortOrder }];
		}
	}

	public static async getItems(
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
				query: 'GET_ITEMS',
				variables,
			});
		}
	}
}
