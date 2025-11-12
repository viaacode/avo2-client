import { type Avo } from '@viaa/avo2-types';
import { flatten } from 'es-toolkit';
import { stringifyUrl } from 'query-string';

import {
	type BulkAddLabelsToCollectionsMutation,
	type BulkAddLabelsToCollectionsMutationVariables,
	type BulkDeleteCollectionsMutation,
	type BulkDeleteCollectionsMutationVariables,
	type BulkDeleteLabelsFromCollectionsMutation,
	type BulkDeleteLabelsFromCollectionsMutationVariables,
	type BulkUpdateAuthorForCollectionsMutation,
	type BulkUpdateAuthorForCollectionsMutationVariables,
	type BulkUpdateDateAndLastAuthorCollectionsMutation,
	type BulkUpdateDateAndLastAuthorCollectionsMutationVariables,
	type BulkUpdatePublishStateForCollectionsMutation,
	type BulkUpdatePublishStateForCollectionsMutationVariables,
} from '../../shared/generated/graphql-db-operations.js';
import {
	BulkAddLabelsToCollectionsDocument,
	BulkDeleteCollectionsDocument,
	BulkDeleteLabelsFromCollectionsDocument,
	BulkUpdateAuthorForCollectionsDocument,
	BulkUpdateDateAndLastAuthorCollectionsDocument,
	BulkUpdatePublishStateForCollectionsDocument,
} from '../../shared/generated/graphql-db-react-query.js';
import { CustomError } from '../../shared/helpers/custom-error.js';
import { getEnv } from '../../shared/helpers/env.js';
import { dataService } from '../../shared/services/data-service.js';

import { type CollectionSortProps, type EditorialType } from './collections-or-bundles.types.js';

export class CollectionsOrBundlesService {
	static async getCollections(
		offset: number,
		limit: number,
		sortColumn: CollectionSortProps,
		sortOrder: Avo.Search.OrderDirection,
		filters: any,
		isCollection: boolean,
		includeRelations: boolean
	): Promise<{ collections: Avo.Collection.Collection[]; total: number }> {
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/admin');
			return await fetchWithLogoutJson<{
				collections: Avo.Collection.Collection[];
				total: number;
			}>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/collections/admin-overview/general`,
					query: {
						offset,
						limit,
						sortColumn,
						sortOrder,
						filters: JSON.stringify(filters),
						isCollection,
						includeRelations,
					},
				})
			);
		} catch (err) {
			throw new CustomError('Failed to get collections from the database', err, {
				offset,
				limit,
				sortColumn,
				sortOrder,
				filters,
				isCollection,
			});
		}
	}

	static async getCollectionEditorial(
		offset: number,
		limit: number,
		sortColumn: CollectionSortProps,
		sortOrder: Avo.Search.OrderDirection,
		filters: any,
		editorialType: EditorialType,
		isCollection: boolean,
		includeRelations: boolean
	): Promise<{ collections: Avo.Collection.Collection[]; total: number }> {
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/admin');
			return await fetchWithLogoutJson<{
				collections: Avo.Collection.Collection[];
				total: number;
			}>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/collections/admin-overview/${editorialType}`,
					query: {
						offset,
						limit,
						sortColumn,
						sortOrder,
						filters: JSON.stringify(filters),
						isCollection,
						includeRelations,
					},
				})
			);
		} catch (err) {
			throw new CustomError(
				'Failed to get collection editorial entries from the database',
				err,
				{
					offset,
					limit,
					sortColumn,
					sortOrder,
					filters,
					editorialType,
					isCollection,
				}
			);
		}
	}

	static async getCollectionIds(filters: any, isCollection: boolean): Promise<string[]> {
		try {
			const { fetchWithLogoutJson } = await import('@meemoo/admin-core-ui/admin');
			const response = await fetchWithLogoutJson<{
				collectionIds: string[];
			}>(
				stringifyUrl({
					url: `${getEnv('PROXY_URL')}/collections/admin-overview/ids`,
					query: {
						filters: JSON.stringify(filters),
						isCollection,
					},
				})
			);
			return response?.collectionIds || [];
		} catch (err) {
			throw new CustomError('Failed to get collection ids from the database', err, {
				filters,
				isCollection,
			});
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
