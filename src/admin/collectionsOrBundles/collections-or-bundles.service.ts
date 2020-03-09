import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services';

import { ITEMS_PER_PAGE } from './collections-or-bundles.const';
import { GET_COLLECTIONS } from './collections-or-bundles.gql';

export class CollectionsOrBundlesService {
	public static async getCollections(
		page: number,
		sortColumn: string,
		sortOrder: Avo.Search.OrderDirection,
		where: any,
	): Promise<[Avo.Collection.Collection[], number]> {
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
				query: 'GET_COLLECTIONS',
				variables,
			});
		}
	}
}
