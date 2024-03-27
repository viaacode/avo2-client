import { type Avo } from '@viaa/avo2-types';
import { flatten } from 'lodash-es';

import {
	BulkAddLabelsToCollectionsMutation,
	BulkAddLabelsToCollectionsMutationVariables,
	BulkDeleteCollectionsMutation,
	BulkDeleteCollectionsMutationVariables,
	BulkDeleteLabelsFromCollectionsMutation,
	BulkDeleteLabelsFromCollectionsMutationVariables,
	BulkUpdateAuthorForCollectionsMutation,
	BulkUpdateAuthorForCollectionsMutationVariables,
	BulkUpdateDateAndLastAuthorCollectionsMutation,
	BulkUpdateDateAndLastAuthorCollectionsMutationVariables,
	BulkUpdatePublishStateForCollectionsMutation,
	BulkUpdatePublishStateForCollectionsMutationVariables,
	GetCollectionActualisationsQuery,
	GetCollectionActualisationsQueryVariables,
	GetCollectionMarcomQuery,
	GetCollectionMarcomQueryVariables,
	GetCollectionQualityCheckQuery,
	GetCollectionQualityCheckQueryVariables,
	GetCollectionsByIdsQuery,
	GetCollectionsByIdsQueryVariables,
	GetCollectionsQuery,
	GetCollectionsQueryVariables,
} from '../../shared/generated/graphql-db-operations';
import {
	BulkAddLabelsToCollectionsDocument,
	BulkDeleteCollectionsDocument,
	BulkDeleteLabelsFromCollectionsDocument,
	BulkUpdateAuthorForCollectionsDocument,
	BulkUpdateDateAndLastAuthorCollectionsDocument,
	BulkUpdatePublishStateForCollectionsDocument,
	GetCollectionsByIdsDocument,
	GetCollectionsDocument,
} from '../../shared/generated/graphql-db-react-query';
import { Lookup_Enum_Relation_Types_Enum } from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { getOrderObject } from '../../shared/helpers/generate-order-gql-query';
import { dataService } from '../../shared/services/data-service';
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

			const response = await dataService.query<
				GetCollectionsQuery,
				GetCollectionsQueryVariables
			>({
				variables,
				query: GetCollectionsDocument,
			});

			const collections = response.app_collections;

			const collectionsCount = response.app_collections_aggregate.aggregate?.count || 0;

			if (!collections) {
				throw new CustomError('Response does not contain any collections', null, {
					response,
				});
			}

			// also fetch if the collection is a copy in a separate query to avoid making the main query slower
			const relations = (await RelationService.fetchRelationsBySubject(
				'collection',
				collections.map((coll) => coll.id),
				Lookup_Enum_Relation_Types_Enum.IsCopyOf
			)) as Avo.Collection.RelationEntry<Avo.Collection.Collection>[];

			relations.forEach((relation) => {
				const collection = collections.find((coll) => coll.id === relation.subject);
				if (collection) {
					(collection as Avo.Collection.Collection).relations = [relation];
				}
			});

			return [collections as Avo.Collection.Collection[], collectionsCount];
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
			const response = await dataService.query<
				GetCollectionsByIdsQuery,
				GetCollectionsByIdsQueryVariables
			>({
				variables: {
					where,
				},
				query: GetCollectionsByIdsDocument,
			});

			return (response.app_collections ?? []).map((coll) => coll.id);
		} catch (err) {
			throw new CustomError('Failed to get collection ids from the database', err, {
				variables: {
					where,
				},
				query: 'GET_COLLECTIONS_BY_IDS',
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
		where:
			| GetCollectionActualisationsQueryVariables['where']
			| GetCollectionQualityCheckQueryVariables['where']
			| GetCollectionMarcomQueryVariables['where'],
		editorialType: EditorialType
	): Promise<[Avo.Collection.Collection[], number]> {
		let variables:
			| GetCollectionActualisationsQueryVariables
			| GetCollectionQualityCheckQueryVariables
			| GetCollectionMarcomQueryVariables
			| null = null;

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

			const response = await dataService.query<
				| GetCollectionActualisationsQuery
				| GetCollectionQualityCheckQuery
				| GetCollectionMarcomQuery,
				| GetCollectionActualisationsQueryVariables
				| GetCollectionQualityCheckQueryVariables
				| GetCollectionMarcomQueryVariables
			>({
				query: EDITORIAL_QUERIES[editorialType],
				variables,
			});

			const collections = response.app_collections as Avo.Collection.Collection[];

			// also fetch if the collection is a copy in a separate query to avoid making the main query slower
			const relations = (await RelationService.fetchRelationsBySubject(
				'collection',
				collections.map((coll) => coll.id),
				Lookup_Enum_Relation_Types_Enum.IsCopyOf
			)) as Avo.Collection.RelationEntry<Avo.Collection.Collection>[];

			relations.forEach((relation) => {
				const collection = collections.find((coll) => coll.id === relation.subject);
				if (collection) {
					(collection as Avo.Collection.Collection).relations = [relation];
				}
			});

			const collectionsCount = response.app_collections_aggregate.aggregate?.count ?? 0;

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
					query: 'GET_COLLECTION_ACTUALISATIONS | GET_COLLECTION_QUALITY_CHECK | GET_COLLECTION_MARCOM',
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
			const response = await dataService.query<
				BulkUpdatePublishStateForCollectionsMutation,
				BulkUpdatePublishStateForCollectionsMutationVariables
			>({
				query: BulkUpdatePublishStateForCollectionsDocument,
				variables: {
					isPublic,
					collectionIds,
					updatedByProfileId,
					now: new Date().toISOString(),
				},
			});

			return response.update_app_collections?.affected_rows ?? 0;
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
			const response = await dataService.query<
				BulkUpdateAuthorForCollectionsMutation,
				BulkUpdateAuthorForCollectionsMutationVariables
			>({
				query: BulkUpdateAuthorForCollectionsDocument,
				variables: {
					authorId,
					collectionIds,
					updatedByProfileId,
					now: new Date().toISOString(),
				},
			});

			return response.update_app_collections?.affected_rows ?? 0;
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
			const response = await dataService.query<
				BulkDeleteCollectionsMutation,
				BulkDeleteCollectionsMutationVariables
			>({
				query: BulkDeleteCollectionsDocument,
				variables: {
					collectionIds,
					updatedByProfileId,
					now: new Date().toISOString(),
				},
			});

			return response.update_app_collections?.affected_rows ?? 0;
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
	): Promise<number> {
		try {
			// First remove the labels, so we can add them without duplicate conflicts
			await CollectionsOrBundlesService.bulkRemoveLabelsFromCollections(
				labels,
				collectionIds,
				updatedByProfileId
			);

			// Add the labels
			const response = await dataService.query<
				BulkAddLabelsToCollectionsMutation,
				BulkAddLabelsToCollectionsMutationVariables
			>({
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
			});

			await this.bulkUpdateDateAndLastAuthorCollections(collectionIds, updatedByProfileId);

			return response.insert_app_collection_labels?.affected_rows ?? 0;
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
	): Promise<number> {
		try {
			const response = await dataService.query<
				BulkDeleteLabelsFromCollectionsMutation,
				BulkDeleteLabelsFromCollectionsMutationVariables
			>({
				query: BulkDeleteLabelsFromCollectionsDocument,
				variables: {
					labels,
					collectionIds,
				},
			});

			await this.bulkUpdateDateAndLastAuthorCollections(collectionIds, updatedByProfileId);

			return response.delete_app_collection_labels?.affected_rows ?? 0;
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
		await dataService.query<
			BulkUpdateDateAndLastAuthorCollectionsMutation,
			BulkUpdateDateAndLastAuthorCollectionsMutationVariables
		>({
			query: BulkUpdateDateAndLastAuthorCollectionsDocument,
			variables: {
				collectionIds,
				updatedByProfileId,
				now: new Date().toISOString(),
			},
		});
	}
}
