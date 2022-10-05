import { Avo } from '@viaa/avo2-types';
import { RelationEntry } from '@viaa/avo2-types/types/collection';
import { flatten, get } from 'lodash-es';

import {
	BulkAddLabelsToCollectionsDocument,
	BulkAddLabelsToCollectionsMutation,
	BulkDeleteCollectionsDocument,
	BulkDeleteCollectionsMutation,
	BulkDeleteLabelsFromCollectionsDocument,
	BulkDeleteLabelsFromCollectionsMutation,
	BulkUpdateAuthorForCollectionsDocument,
	BulkUpdateAuthorForCollectionsMutation,
	BulkUpdateDateAndLastAuthorCollectionsDocument,
	BulkUpdateDateAndLastAuthorCollectionsMutation,
	BulkUpdatePublishStateForCollectionsDocument,
	BulkUpdatePublishStateForCollectionsMutation,
	GetCollectionsByIdsDocument,
	GetCollectionsByIdsQuery,
	GetCollectionsByIdsQueryVariables,
	GetCollectionsDocument,
	GetCollectionsQuery,
	GetCollectionsQueryVariables,
	Lookup_Enum_Relation_Types_Enum,
} from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { ApolloCacheManager, dataService } from '../../shared/services';
import { RelationService } from '../../shared/services/relation-service/relation.service';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';

import {
	EDITORIAL_QUERIES,
	EDITORIAL_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
	ITEMS_PER_PAGE,
	TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT,
} from './collections-or-bundles.const';
import {
	CollectionOrBundleActualisationOverviewTableCols,
	CollectionOrBundleMarcomOverviewTableCols,
	CollectionOrBundleQualityCheckOverviewTableCols,
	CollectionsOrBundlesOverviewTableCols,
	EditorialType,
} from './collections-or-bundles.types';

export class CollectionsOrBundlesService {
	static async getCollections(
		page: number,
		sortColumn: CollectionsOrBundlesOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: GetCollectionsQueryVariables['where']
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
					tableColumnDataType,
					TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};

			const response = await dataService.query<GetCollectionsQuery>({
				variables,
				query: GetCollectionsDocument,
			});

			const collections: Avo.Collection.Collection[] | null = get(
				response,
				'data.app_collections'
			);

			const collectionsCount = get(
				response,
				'data.app_collections_aggregate.aggregate.count'
			);

			if (!collections) {
				throw new CustomError('Response does not contain any collections', null, {
					response,
				});
			}

			// also fetch if the collection is a copy in a separate query to avoid making the main query slower
			const relations = (await RelationService.fetchRelationsBySubject(
				'collection',
				collections.map((coll: Avo.Collection.Collection) => coll.id),
				Lookup_Enum_Relation_Types_Enum.IsCopyOf
			)) as RelationEntry<Avo.Collection.Collection>[];

			relations.forEach((relation) => {
				const collection = collections.find((coll) => coll.id === relation.subject);
				if (collection) {
					collection.relations = [relation];
				}
			});

			return [collections, collectionsCount];
		} catch (err) {
			throw new CustomError('Failed to get collections from the database', err, {
				variables,
				query: 'GET_COLLECTIONS',
			});
		}
	}

	static async getCollectionIds(
		where: GetCollectionsByIdsQueryVariables['where']
	): Promise<string[]> {
		try {
			const response = await dataService.query<GetCollectionsByIdsQuery>({
				variables: {
					where,
				},
				query: GetCollectionsByIdsDocument,
			});

			return get(response, 'data.app_collections', []).map(
				(coll: Partial<Avo.Collection.Collection>) => coll.id
			);
		} catch (err) {
			throw new CustomError('Failed to get collection ids from the database', err, {
				variables: {
					where,
				},
				query: 'GET_COLLECTION_IDS',
			});
		}
	}

	static async getCollectionEditorial(
		page: number,
		sortColumn:
			| CollectionOrBundleActualisationOverviewTableCols
			| CollectionOrBundleQualityCheckOverviewTableCols
			| CollectionOrBundleMarcomOverviewTableCols,
		sortOrder: Avo.Search.OrderDirection,
		tableColumnDataType: TableColumnDataType,
		where: any,
		editorialType: EditorialType
	): Promise<[Avo.Collection.Collection[], number]> {
		let variables: any;

		try {
			variables = {
				where: {
					...where,
				},
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: getOrderObject(
					sortColumn,
					sortOrder,
					tableColumnDataType,
					EDITORIAL_TABLE_COLUMN_TO_DATABASE_ORDER_OBJECT
				),
			};

			const response = await dataService.query({
				variables,
				query: EDITORIAL_QUERIES[editorialType],
			});

			const collections: Avo.Collection.Collection[] | null = get(
				response,
				'data.app_collections'
			);

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
			throw new CustomError(
				'Failed to get collection editorial entries from the database',
				err,
				{
					variables,
					editorialType,
					query: 'GET_COLLECTION_ACTUALISATION | GET_COLLECTION_QUALITY_CHECK | GET_COLLECTION_MARCOM',
				}
			);
		}
	}

	static async bulkChangePublicStateForCollections(
		isPublic: boolean,
		collectionIds: string[],
		updatedByProfileId: string
	): Promise<number> {
		try {
			const response = await dataService.query<BulkUpdatePublishStateForCollectionsMutation>({
				query: BulkUpdatePublishStateForCollectionsDocument,
				variables: {
					isPublic,
					collectionIds,
					updatedByProfileId,
					now: new Date().toISOString(),
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

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

	static async bulkUpdateAuthorForCollections(
		authorId: string,
		collectionIds: string[],
		updatedByProfileId: string
	): Promise<number> {
		try {
			const response = await dataService.query<BulkUpdateAuthorForCollectionsMutation>({
				query: BulkUpdateAuthorForCollectionsDocument,
				variables: {
					authorId,
					collectionIds,
					updatedByProfileId,
					now: new Date().toISOString(),
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			return get(response, 'data.update_app_collections.affected_rows');
		} catch (err) {
			throw new CustomError('Failed to update author for collections in the database', err, {
				authorId,
				collectionIds,
				query: 'BULK_UPDATE_AUTHOR_FOR_COLLECTIONS',
			});
		}
	}

	static async bulkDeleteCollections(
		collectionIds: string[],
		updatedByProfileId: string
	): Promise<number> {
		try {
			const response = await dataService.query<BulkDeleteCollectionsMutation>({
				query: BulkDeleteCollectionsDocument,
				variables: {
					collectionIds,
					updatedByProfileId,
					now: new Date().toISOString(),
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			return get(response, 'data.update_app_collections.affected_rows');
		} catch (err) {
			throw new CustomError('Failed to delete collections in the database', err, {
				collectionIds,
				query: 'BULK_DELETE_COLLECTIONS',
			});
		}
	}

	static async bulkAddLabelsToCollections(
		labels: string[],
		collectionIds: string[],
		updatedByProfileId: string
	) {
		try {
			// First remove the labels, so we can add them without duplicate conflicts
			await CollectionsOrBundlesService.bulkRemoveLabelsFromCollections(
				labels,
				collectionIds,
				updatedByProfileId
			);

			// Add the labels
			const response = await dataService.query<BulkAddLabelsToCollectionsMutation>({
				query: BulkAddLabelsToCollectionsDocument,
				variables: {
					labels: flatten(
						labels.map((label) =>
							collectionIds.map((collectionId) => ({
								label,
								collection_uuid: collectionId,
							}))
						)
					),
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			await this.bulkUpdateDateAndLastAuthorCollections(collectionIds, updatedByProfileId);

			return get(response, 'data.insert_app_collection_labels.affected_rows');
		} catch (err) {
			throw new CustomError('Failed to bulk add labels to collections', err, {
				labels,
				collectionIds,
				query: 'BULK_ADD_LABELS_TO_COLLECTIONS, BULK_UPDATE_DATE_AND_LAST_AUTHOR_COLLECTIONS',
			});
		}
	}

	static async bulkRemoveLabelsFromCollections(
		labels: string[],
		collectionIds: string[],
		updatedByProfileId: string
	) {
		try {
			const response = await dataService.query<BulkDeleteLabelsFromCollectionsMutation>({
				query: BulkDeleteLabelsFromCollectionsDocument,
				variables: {
					labels,
					collectionIds,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			await this.bulkUpdateDateAndLastAuthorCollections(collectionIds, updatedByProfileId);

			return get(response, 'data.delete_app_collection_labels.affected_rows');
		} catch (err) {
			throw new CustomError('Failed to bulk delete labels from collections', err, {
				labels,
				collectionIds,
				query: 'BULK_DELETE_LABELS_FROM_COLLECTIONS',
			});
		}
	}

	private static async bulkUpdateDateAndLastAuthorCollections(
		collectionIds: string[],
		updatedByProfileId: string
	): Promise<void> {
		await dataService.query<BulkUpdateDateAndLastAuthorCollectionsMutation>({
			query: BulkUpdateDateAndLastAuthorCollectionsDocument,
			variables: {
				collectionIds,
				updatedByProfileId,
				now: new Date().toISOString(),
			},
			update: ApolloCacheManager.clearCollectionCache,
		});
	}
}
