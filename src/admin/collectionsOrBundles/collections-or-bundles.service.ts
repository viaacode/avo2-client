import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { CustomError } from '../../shared/helpers';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { dataService } from '../../shared/services';

import {
	ITEMS_PER_PAGE,
	TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './collections-or-bundles.const';
import {
	BULK_DELETE_COLLECTIONS,
	BULK_UPDATE_AUTHOR_FOR_COLLECTIONS,
	BULK_UPDATE_PUBLISH_STATE_FOR_COLLECTIONS,
	GET_COLLECTIONS,
} from './collections-or-bundles.gql';
import { CollectionsOrBundlesOverviewTableCols } from './collections-or-bundles.types';

export class CollectionsOrBundlesService {
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
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
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

	public static async bulkChangePublicStateForCollections(
		isPublic: boolean,
		collectionIds: string[]
	): Promise<number> {
		try {
			const response = await dataService.query({
				query: BULK_UPDATE_PUBLISH_STATE_FOR_COLLECTIONS,
				variables: {
					isPublic,
					collectionIds,
				},
			});
			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}

			return get(response, 'data.update_app_collections.affected_rows');
		} catch (err) {
			throw new CustomError(
				'Failed to update publish state for collections in the database',
				err,
				{
					collectionIds,
					isPublic,
					query: 'BULK_UPDATE_PUBLISH_STATE_FOR_COLLECTIONS',
				}
			);
		}
	}

	public static async bulkUpdateAuthorForCollections(
		authorId: string,
		collectionIds: string[]
	): Promise<number> {
		try {
			const response = await dataService.query({
				query: BULK_UPDATE_AUTHOR_FOR_COLLECTIONS,
				variables: {
					authorId,
					collectionIds,
				},
			});
			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}

			return get(response, 'data.update_app_collections.affected_rows');
		} catch (err) {
			throw new CustomError('Failed to update author for collections in the database', err, {
				authorId,
				collectionIds,
				query: 'BULK_UPDATE_AUTHOR_FOR_COLLECTIONS',
			});
		}
	}

	public static async bulkDeleteCollections(collectionIds: string[]): Promise<number> {
		try {
			const response = await dataService.query({
				query: BULK_DELETE_COLLECTIONS,
			});
			if (response.errors) {
				throw new CustomError('GraphQL query has errors', null, { response });
			}

			return get(response, 'data.update_app_collections.affected_rows');
		} catch (err) {
			throw new CustomError('Failed to delete collections in the database', err, {
				collectionIds,
				query: 'BULK_DELETE_COLLECTIONS',
			});
		}
	}
}
