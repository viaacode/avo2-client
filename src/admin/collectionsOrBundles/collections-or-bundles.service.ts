import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services';

import {
	ITEMS_PER_PAGE,
	TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './collections-or-bundles.const';
import { GET_COLLECTIONS } from './collections-or-bundles.gql';
import { CollectionsOrBundlesOverviewTableCols } from './collections-or-bundles.types';

export class CollectionsOrBundlesService {
	private static getOrderObject(
		sortColumn: CollectionsOrBundlesOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection
	) {
		const getOrderFunc: Function | undefined =
			TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT[sortColumn];
		if (getOrderFunc) {
			return [getOrderFunc(sortOrder)];
		}
		return [{ [sortColumn]: sortOrder }];
	}

	public static async getCollections(
		page: number,
		sortColumn: CollectionsOrBundlesOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		where: any
	): Promise<[Avo.Collection.Collection[], number]> {
		let variables: any;
		try {
			variables = {
				where,
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: CollectionsOrBundlesService.getOrderObject(sortColumn, sortOrder),
			};
			const response = await dataService.query({
				variables,
				query: GET_COLLECTIONS,
			});
			const collections = get(response, 'data.app_collections');
			const collectionsCount = get(
				response,
				'data.app_collections_aggregate.aggregate.count'
			);

			if (!collections) {
				throw new CustomError('Response does not contain any collections', null, {
					response,
				});
			}

			return [collections, collectionsCount];
		} catch (err) {
			throw new CustomError('Failed to get collections from the database', err, {
				variables,
				query: 'GET_COLLECTIONS',
			});
		}
	}
}
