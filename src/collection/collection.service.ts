import { fetchWithLogoutJson } from '@meemoo/admin-core-ui';
import { PermissionName } from '@viaa/avo2-types';
import type { Avo } from '@viaa/avo2-types';
import { endOfDay, startOfDay } from 'date-fns';
import { cloneDeep, compact, fromPairs, get, isEqual, isNil, without } from 'lodash-es';
import queryString from 'query-string';

import { getProfileId } from '../authentication/helpers/get-profile-id';
import { PermissionService } from '../authentication/helpers/permission-service';
import {
	App_Collection_Marcom_Log_Insert_Input,
	DeleteCollectionBookmarksDocument,
	DeleteCollectionBookmarksMutation,
	DeleteCollectionBookmarksMutationVariables,
	DeleteCollectionFragmentByIdDocument,
	DeleteCollectionFragmentByIdMutation,
	DeleteCollectionLabelsDocument,
	DeleteCollectionLabelsMutation,
	DeleteCollectionLabelsMutationVariables,
	DeleteMarcomEntriesByParentCollectionIdDocument,
	DeleteMarcomEntriesByParentCollectionIdMutation,
	DeleteMarcomEntriesByParentCollectionIdMutationVariables,
	DeleteMarcomEntryDocument,
	DeleteMarcomEntryMutation,
	DeleteMarcomEntryMutationVariables,
	GetBookmarkedCollectionsByOwnerDocument,
	GetBookmarkedCollectionsByOwnerQuery,
	GetBookmarkedCollectionsByOwnerQueryVariables,
	GetBundleTitlesByOwnerDocument,
	GetBundleTitlesByOwnerQuery,
	GetBundleTitlesByOwnerQueryVariables,
	GetCollectionByTitleOrDescriptionDocument,
	GetCollectionByTitleOrDescriptionQuery,
	GetCollectionMarcomEntriesDocument,
	GetCollectionMarcomEntriesQuery,
	GetCollectionMarcomEntriesQueryVariables,
	GetCollectionsByItemUuidDocument,
	GetCollectionsByItemUuidQuery,
	GetCollectionsByOwnerDocument,
	GetCollectionsByOwnerQuery,
	GetCollectionsByOwnerQueryVariables,
	GetCollectionTitlesByOwnerDocument,
	GetCollectionTitlesByOwnerQuery,
	GetCollectionTitlesByOwnerQueryVariables,
	GetOrganisationContentDocument,
	GetOrganisationContentQuery,
	GetOrganisationContentQueryVariables,
	GetPublicCollectionsByIdDocument,
	GetPublicCollectionsByIdQuery,
	GetPublicCollectionsByIdQueryVariables,
	GetPublicCollectionsByTitleDocument,
	GetPublicCollectionsByTitleQuery,
	GetPublicCollectionsByTitleQueryVariables,
	GetPublicCollectionsDocument,
	GetPublicCollectionsQuery,
	GetPublishedBundlesContainingCollectionDocument,
	GetPublishedBundlesContainingCollectionQuery,
	GetQualityLabelsDocument,
	GetQualityLabelsQuery,
	InsertCollectionDocument,
	InsertCollectionFragmentsDocument,
	InsertCollectionFragmentsMutation,
	InsertCollectionFragmentsMutationVariables,
	InsertCollectionLabelsDocument,
	InsertCollectionLabelsMutation,
	InsertCollectionLabelsMutationVariables,
	InsertCollectionManagementEntryDocument,
	InsertCollectionManagementEntryMutation,
	InsertCollectionManagementQualityCheckEntryDocument,
	InsertCollectionManagementQualityCheckEntryMutation,
	InsertCollectionManagementQualityCheckEntryMutationVariables,
	InsertCollectionMutation,
	InsertMarcomEntryDocument,
	InsertMarcomEntryMutation,
	InsertMarcomEntryMutationVariables,
	InsertMarcomNoteDocument,
	InsertMarcomNoteMutation,
	InsertMarcomNoteMutationVariables,
	Lookup_Enum_Collection_Management_Qc_Label_Enum,
	Lookup_Enum_Relation_Types_Enum,
	SoftDeleteCollectionByIdDocument,
	SoftDeleteCollectionByIdMutation,
	SoftDeleteCollectionByIdMutationVariables,
	UpdateCollectionByIdDocument,
	UpdateCollectionByIdMutation,
	UpdateCollectionByIdMutationVariables,
	UpdateCollectionFragmentByIdDocument,
	UpdateCollectionFragmentByIdMutation,
	UpdateCollectionFragmentByIdMutationVariables,
	UpdateCollectionManagementEntryDocument,
	UpdateCollectionManagementEntryMutation,
	UpdateMarcomNoteDocument,
	UpdateMarcomNoteMutation,
} from '../shared/generated/graphql-db-types';
import { CustomError, getEnv } from '../shared/helpers';
import { convertRteToString } from '../shared/helpers/convert-rte-to-string';
import { tHtml } from '../shared/helpers/translate';
import { isUuid } from '../shared/helpers/uuid';
import { dataService } from '../shared/services/data-service';
import { RelationService } from '../shared/services/relation-service/relation.service';
import { ToastService } from '../shared/services/toast-service';
import { VideoStillService } from '../shared/services/video-stills-service';

import {
	cleanCollectionBeforeSave,
	getFragmentIdsFromCollection,
	getFragmentsFromCollection,
	getValidationErrorForSave,
	getValidationErrorsForPublish,
	keepCoreCollectionProperties,
} from './collection.helpers';
import { Collection, ContentTypeNumber, MarcomEntry, QualityLabel } from './collection.types';
import { canManageEditorial } from './helpers/can-manage-editorial';

export interface OrganisationContentItem {
	id: string;
	title: string;
	type: {
		label: string;
	};
	owner: {
		full_name: string;
	};
	last_editor?: {
		full_name: string;
	};
	created_at: string;
	updated_at: string;
}

export class CollectionService {
	private static collectionLabels: { [id: string]: string } | null;

	/**
	 * Insert collection and underlying collection fragments.
	 *
	 * @param newCollection Collection that must be inserted.
	 */
	static async insertCollection(
		newCollection: Partial<Avo.Collection.Collection>
	): Promise<Avo.Collection.Collection> {
		try {
			newCollection.created_at = new Date().toISOString();
			newCollection.updated_at = newCollection.created_at;
			const cleanedCollection = cleanCollectionBeforeSave(newCollection);

			// insert collection
			const insertResponse = await dataService.query<InsertCollectionMutation>({
				query: InsertCollectionDocument,
				variables: {
					collection: cleanedCollection,
				},
			});

			// retrieve inserted collection from response
			const insertedCollection = insertResponse.insert_app_collections?.returning?.[0];

			if (!insertedCollection || isNil(insertedCollection.id)) {
				throw new CustomError('Failed to fetch inserted collection', null, {
					insertResponse,
				});
			}

			newCollection.id = insertedCollection.id;

			// retrieve collection fragments from inserted collection
			const fragments = getFragmentsFromCollection(newCollection);

			// insert fragments
			if (fragments && fragments.length) {
				newCollection.collection_fragments = await CollectionService.insertFragments(
					newCollection.id as string,
					fragments
				);
			}

			return newCollection as Avo.Collection.Collection;
		} catch (err) {
			throw new CustomError('Failed to insert collection', err, {
				newCollection,
			});
		}
	}

	private static getLabels(
		collection: Partial<Avo.Collection.Collection> | null
	): Avo.Collection.Label[] {
		return get(collection, 'collection_labels', []) as Avo.Collection.Label[];
	}

	/**
	 * Update collection and underlying collection fragments.
	 *
	 * @param initialColl
	 * @param updatedColl
	 * @param user
	 */
	static async updateCollection(
		initialColl: Avo.Collection.Collection | null,
		updatedColl: Partial<Avo.Collection.Collection>,
		user: Avo.User.User
	): Promise<Avo.Collection.Collection | null> {
		try {
			// Convert fragment description editor states to html strings
			const updatedCollection = convertRteToString(updatedColl);
			const initialCollection = convertRteToString(initialColl);

			// abort if updatedCollection is empty
			if (!updatedCollection) {
				ToastService.danger(
					tHtml('collection/collection___de-huidige-collectie-is-niet-gevonden')
				);
				return null;
			}

			// validate collection before update
			let validationErrors: string[];

			if (updatedCollection.is_public) {
				validationErrors = await getValidationErrorsForPublish(updatedCollection);
			} else {
				validationErrors = await getValidationErrorForSave(updatedCollection);
			}

			// display validation errors
			if (validationErrors.length) {
				ToastService.danger(validationErrors);
				return null;
			}

			const newCollection: Partial<Avo.Collection.Collection> = cloneDeep(updatedCollection);

			// remove custom_title and custom_description if user wants to use the item's original title and description
			(newCollection.collection_fragments || []).forEach(
				(fragment: Avo.Collection.Fragment) => {
					if (!fragment.use_custom_fields) {
						fragment.custom_title = null;
						fragment.custom_description = null;
					}
				}
			);

			// null should not default to prevent defaulting of null, we don't use lodash's default value parameter
			const initialFragmentIds: (number | string)[] =
				getFragmentIdsFromCollection(initialCollection);
			const currentFragmentIds: (number | string)[] =
				getFragmentIdsFromCollection(newCollection);

			// Fragments to insert do not have an id yet
			const newFragments = getFragmentsFromCollection(newCollection).filter(
				(fragment) => fragment.id < 0 || Object.is(fragment.id, -0) || isNil(fragment.id)
			);

			// delete fragments that were removed from collection
			const deleteFragmentIds = without(initialFragmentIds, ...currentFragmentIds);

			// update fragments that are neither inserted nor deleted
			const updateFragmentIds = currentFragmentIds.filter((fragmentId: number | string) =>
				initialFragmentIds.includes(fragmentId)
			);

			// insert fragments. New fragments do not have a fragment id yet
			const insertPromise = CollectionService.insertFragments(
				newCollection.id as string,
				newFragments
			);

			// delete fragments
			const deletePromises = deleteFragmentIds.map((id: number | string) =>
				dataService.query<DeleteCollectionFragmentByIdMutation>({
					query: DeleteCollectionFragmentByIdDocument,
					variables: { id },
				})
			);

			// update fragments
			const updatePromises = compact(
				updateFragmentIds.map((id: number | string) => {
					let fragmentToUpdate: Avo.Collection.Fragment | undefined =
						getFragmentsFromCollection(newCollection).find(
							(fragment: Avo.Collection.Fragment) => {
								return Number(id) === fragment.id;
							}
						);

					if (!fragmentToUpdate) {
						ToastService.info(
							tHtml(
								'collection/collection___kan-het-te-updaten-fragment-niet-vinden-id-id',
								{ id }
							)
						);
						return null;
					}

					fragmentToUpdate = cloneDeep(fragmentToUpdate);

					delete (fragmentToUpdate as any).__typename;
					delete fragmentToUpdate.item_meta;
					fragmentToUpdate.updated_at = new Date().toISOString();

					const variables: UpdateCollectionFragmentByIdMutationVariables = {
						id: id as number,
						fragment: {
							...fragmentToUpdate,
							id: fragmentToUpdate.id as number,
						},
					};
					return dataService.query<UpdateCollectionFragmentByIdMutation>({
						query: UpdateCollectionFragmentByIdDocument,
						variables,
					});
				})
			);

			// perform crud requests in parallel
			await Promise.all([
				insertPromise as Promise<any>,
				...(deletePromises as Promise<any>[]),
				...(updatePromises as Promise<any>[]),
			]);

			if (newCollection.type_id === ContentTypeNumber.collection) {
				// determine new thumbnail path since videos could have changed order / been deleted
				newCollection.thumbnail_path = await this.getThumbnailPathForCollection(
					newCollection
				);
			}

			// update collection
			const cleanedCollection: Partial<Avo.Collection.Collection> =
				cleanCollectionBeforeSave(newCollection);

			// set updated_at date if collection has changes (without taking into account the management fields)
			if (
				!isEqual(
					keepCoreCollectionProperties(updatedCollection),
					keepCoreCollectionProperties(initialCollection)
				)
			) {
				cleanedCollection.updated_at = new Date().toISOString();
				cleanedCollection.updated_by_profile_id = getProfileId(user);
			}

			await this.updateCollectionProperties(newCollection.id as string, cleanedCollection);

			// Update collection labels
			if (
				PermissionService.hasPerm(user, PermissionName.EDIT_COLLECTION_LABELS) ||
				PermissionService.hasPerm(user, PermissionName.EDIT_BUNDLE_LABELS)
			) {
				// Update collection labels
				const initialLabels: string[] = this.getLabels(initialCollection).map(
					(labelObj: any) => labelObj.label
				);
				const updatedLabels: string[] = this.getLabels(newCollection).map(
					(labelObj: any) => labelObj.label
				);

				const addedLabels: string[] = without(updatedLabels, ...initialLabels);
				const deletedLabels: string[] = without(initialLabels, ...updatedLabels);
				await Promise.all([
					CollectionService.addLabelsToCollection(
						newCollection.id as string,
						addedLabels
					),
					CollectionService.deleteLabelsFromCollection(
						newCollection.id as string,
						deletedLabels
					),
				]);
			}

			// Update collection management
			if (get(updatedCollection, 'is_managed', false)) {
				await CollectionService.saveCollectionManagementData(
					newCollection.id as string,
					initialCollection,
					updatedCollection
				);
			}

			return newCollection as Avo.Collection.Collection;
		} catch (err) {
			throw new CustomError('Failed to update collection or its fragments', err, {
				initialColl,
				updatedColl,
			});
		}
	}

	private static saveCollectionManagementData = async (
		collectionId: string,
		initialCollection: Partial<Avo.Collection.Collection> | null,
		updatedCollection: Partial<Avo.Collection.Collection>
	) => {
		try {
			if (!get(initialCollection, 'management') && !!get(updatedCollection, 'management')) {
				// Create management entry
				await CollectionService.insertManagementEntry(collectionId, {
					current_status: get(updatedCollection, 'management.current_status', null),
					manager_profile_id: get(
						updatedCollection,
						'management.manager_profile_id',
						null
					),
					status_valid_until: get(
						updatedCollection,
						'management.status_valid_until',
						null
					),
					note: get(updatedCollection, 'management.note', null),
					updated_at: get(updatedCollection, 'management.updated_at', undefined),
				});
			} else if (
				!!get(initialCollection, 'management') &&
				!!get(updatedCollection, 'management')
			) {
				// Update management entry
				await CollectionService.updateManagementEntry(collectionId, {
					current_status: get(updatedCollection, 'management.current_status', null),
					manager_profile_id: get(
						updatedCollection,
						'management.manager_profile_id',
						null
					),
					status_valid_until: get(
						updatedCollection,
						'management.status_valid_until',
						null
					),
					note: get(updatedCollection, 'management.note', null),
					updated_at: get(updatedCollection, 'management.updated_at', undefined),
				});
			}

			if (
				!!get(updatedCollection, 'management_language_check') &&
				!!get(updatedCollection, 'management_quality_check')
			) {
				// Insert QC entries
				const initialLanguageCheckStatus = get(
					initialCollection,
					'management_language_check[0].qc_status'
				);
				const updatedLanguageCheckStatus = get(
					updatedCollection,
					'management_language_check[0].qc_status'
				);
				const initialQualityCheckStatus = get(
					initialCollection,
					'management_quality_check[0].qc_status'
				);
				const updatedQualityCheckStatus = get(
					updatedCollection,
					'management_quality_check[0].qc_status'
				);
				const equalLanguageCheckStatus =
					initialLanguageCheckStatus !== updatedLanguageCheckStatus;
				const equalQualityCheckStatus =
					initialQualityCheckStatus !== updatedQualityCheckStatus;
				const equalLanguageCheckAssignee =
					get(initialCollection, 'management_language_check[0].assignee_profile_id') !==
					get(updatedCollection, 'management_language_check[0].assignee_profile_id');
				const equalLanguageCheckComment =
					get(initialCollection, 'management_language_check[0].comment') !==
					get(updatedCollection, 'management_language_check[0].comment');

				const initialApprovedStatus =
					initialLanguageCheckStatus && initialQualityCheckStatus;
				const updatedApprovedStatus =
					updatedLanguageCheckStatus && updatedQualityCheckStatus;

				if (
					equalLanguageCheckStatus ||
					equalLanguageCheckAssignee ||
					equalLanguageCheckComment
				) {
					await CollectionService.createManagementQCEntry(collectionId, {
						qc_label: Lookup_Enum_Collection_Management_Qc_Label_Enum.Taalcheck,
						qc_status:
							get(updatedCollection, 'management_language_check[0].qc_status') ??
							null,
						assignee_profile_id: get(
							updatedCollection,
							'management_language_check[0].assignee_profile_id',
							null
						),
						comment: get(
							updatedCollection,
							'management_language_check[0].comment',
							null
						),
					});
				}
				// We use language check for assignee because the UI only requests this info once from the user
				// Unfortunately the database assumes this can be set per QC entry
				if (
					equalQualityCheckStatus ||
					equalLanguageCheckAssignee ||
					equalLanguageCheckComment
				) {
					await CollectionService.createManagementQCEntry(collectionId, {
						qc_label: Lookup_Enum_Collection_Management_Qc_Label_Enum.Kwaliteitscheck,
						qc_status:
							get(updatedCollection, 'management_quality_check[0].qc_status') ?? null,
						assignee_profile_id: get(
							updatedCollection,
							'management_language_check[0].assignee_profile_id',
							null
						),
						comment: null,
					});
				}

				// Save approved_at entry when updated statuses are both OK and initial statuses are not both OK
				if (initialApprovedStatus !== updatedApprovedStatus && updatedApprovedStatus) {
					await CollectionService.createManagementQCEntry(collectionId, {
						qc_label: Lookup_Enum_Collection_Management_Qc_Label_Enum.Eindcheck,
						qc_status: null,
						assignee_profile_id: get(
							updatedCollection,
							'management_language_check[0].assignee_profile_id',
							null
						),
						comment: null,
					});
				}
			}

			const marcomNoteId = get(updatedCollection, 'marcom_note.id');
			const marcomNoteText = get(updatedCollection, 'marcom_note.note');

			if (!isNil(marcomNoteText)) {
				if (!isNil(marcomNoteId)) {
					// Already have note id => so we should update the note text
					await CollectionService.updateMarcomNote(marcomNoteId, marcomNoteText);
				} else {
					// We don't have a note id, but do have a note, so we should do an insert
					await CollectionService.insertMarcomNote(collectionId, marcomNoteText);
				}
			}
		} catch (err) {
			throw new CustomError('Failed to save management data to the database', err, {
				initialCollection,
				updatedCollection,
			});
		}
	};

	private static insertManagementEntry = async (
		collectionId: string,
		managementData: Partial<Avo.Collection.Management>
	) => {
		try {
			await dataService.query<InsertCollectionManagementEntryMutation>({
				query: InsertCollectionManagementEntryDocument,
				variables: {
					...managementData,
					collection_id: collectionId,
				},
			});
		} catch (err) {
			throw new CustomError('Failed to create collection management entry', err, {
				collectionId,
				managementData,
				query: 'INSERT_COLLECTION_MANAGEMENT_ENTRY',
			});
		}
	};

	private static updateManagementEntry = async (
		collectionId: string,
		managementData: Partial<Avo.Collection.Management>
	) => {
		try {
			await dataService.query<UpdateCollectionManagementEntryMutation>({
				query: UpdateCollectionManagementEntryDocument,
				variables: {
					...managementData,
					collection_id: collectionId,
				},
			});
		} catch (err) {
			throw new CustomError('Failed to update collection management entry', err, {
				collectionId,
				managementData,
				query: 'UPDATE_COLLECTION_MANAGEMENT_ENTRY',
			});
		}
	};

	private static createManagementQCEntry = async (
		collectionId: string,
		managementQCData: Partial<InsertCollectionManagementQualityCheckEntryMutationVariables>
	) => {
		try {
			const variables: InsertCollectionManagementQualityCheckEntryMutationVariables = {
				...managementQCData,
				collection_id: collectionId,
			};
			await dataService.query<InsertCollectionManagementQualityCheckEntryMutation>({
				query: InsertCollectionManagementQualityCheckEntryDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError(
				'Failed to create collection management quality check entry',
				err,
				{
					collectionId,
					managementQCData,
					query: 'INSERT_COLLECTION_MANAGEMENT_QC_ENTRY',
				}
			);
		}
	};

	static updateCollectionProperties = async (
		id: string,
		collection: Partial<Avo.Collection.Collection>
	): Promise<void> => {
		try {
			const dbCollection = cleanCollectionBeforeSave(collection);

			const variables: UpdateCollectionByIdMutationVariables = {
				id,
				collection: dbCollection,
			};
			await dataService.query<UpdateCollectionByIdMutation>({
				query: UpdateCollectionByIdDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to update collection properties', err, {
				id,
				collection,
				query: 'UPDATE_COLLECTION',
			});
		}
	};

	/**
	 * Delete collection by id.
	 *
	 * @param collectionId Unique identifier of the collection.
	 */
	static deleteCollection = async (collectionId: string): Promise<void> => {
		try {
			// delete collection by id
			await Promise.all([
				dataService.query<SoftDeleteCollectionByIdMutation>({
					query: SoftDeleteCollectionByIdDocument,
					variables: {
						id: collectionId,
					} as SoftDeleteCollectionByIdMutationVariables,
				}),
				dataService.query<DeleteCollectionBookmarksMutation>({
					query: DeleteCollectionBookmarksDocument,
					variables: {
						id: collectionId,
					} as DeleteCollectionBookmarksMutationVariables,
				}),
			]);
		} catch (err) {
			throw new CustomError(`Failed to delete collection or bundle'}`, err, {
				collectionId,
			});
		}
	};

	/**
	 * Add duplicate of collection
	 *
	 * @param collection
	 * @param user
	 * @param copyPrefix
	 * @param copyRegex
	 *
	 * @returns Duplicate collection.
	 */
	static async duplicateCollection(
		collection: Avo.Collection.Collection,
		user: Avo.User.User,
		copyPrefix: string,
		copyRegex: RegExp
	): Promise<Avo.Collection.Collection> {
		try {
			const collectionToInsert = { ...collection };

			// update attributes specific to duplicate
			collectionToInsert.owner_profile_id = getProfileId(user);
			collectionToInsert.is_public = false;

			if (canManageEditorial(user)) {
				collectionToInsert.is_managed = true;
			}

			// remove id from duplicate
			delete (collectionToInsert as any).id;

			try {
				collectionToInsert.title = await this.getCopyTitleForCollection(
					copyPrefix,
					copyRegex,
					collectionToInsert.title,
					user
				);
			} catch (err) {
				const customError = new CustomError(
					'Failed to retrieve title for duplicate collection',
					err,
					{
						collectionToInsert,
					}
				);

				console.error(customError);

				// fallback to simple copy title
				collectionToInsert.title = `${copyPrefix.replace(' %index%', '')}${
					collectionToInsert.title
				}`;
			}

			// Check is_managed status
			// Should be copied to new collection if user group is one of [redacteur, eindredacteur, beheerder]
			// Otherwise should be false
			if (!canManageEditorial(user)) {
				collectionToInsert.is_managed = false;
			}

			// insert duplicated collection
			const duplicatedCollection = await CollectionService.insertCollection(
				collectionToInsert
			);

			await RelationService.insertRelation(
				'collection',
				duplicatedCollection.id,
				Lookup_Enum_Relation_Types_Enum.IsCopyOf,
				collection.id
			);

			return duplicatedCollection;
		} catch (err) {
			throw new CustomError('Failed to duplicate collection', err, {
				collection,
				user,
				copyPrefix,
				copyRegex,
			});
		}
	}

	/**
	 * Retrieve collections or bundles.
	 *
	 * @param limit Numeric value to define the maximum amount of items in response.
	 * @param typeId 3 for collections, 4 for bundles
	 * @returns Collections limited by `limit`.
	 */
	static async fetchCollectionsOrBundles(
		limit: number,
		typeId: ContentTypeNumber
	): Promise<GetPublicCollectionsQuery['app_collections']> {
		try {
			// retrieve collections
			const response = await dataService.query<GetPublicCollectionsQuery>({
				query: GetPublicCollectionsDocument,
				variables: { limit, typeId },
			});

			return response.app_collections || [];
		} catch (err) {
			throw new CustomError('Het ophalen van de collecties is mislukt.', err, {
				query: 'GET_PUBLIC_COLLECTIONS',
				variables: { limit },
			});
		}
	}

	static async fetchOrganisationContent(
		offset: GetOrganisationContentQueryVariables['offset'],
		limit: GetOrganisationContentQueryVariables['limit'],
		order: GetOrganisationContentQueryVariables['order'],
		companyId: string
	): Promise<OrganisationContentItem[]> {
		try {
			// retrieve collections
			const variables: GetOrganisationContentQueryVariables = {
				offset,
				limit,
				order,
				company_id: companyId,
			};
			const response = await dataService.query<GetOrganisationContentQuery>({
				query: GetOrganisationContentDocument,
				variables,
			});

			return response.app_collections as OrganisationContentItem[];
		} catch (err) {
			throw new CustomError('Het ophalen van de collecties is mislukt.', err, {
				query: 'GET_PUBLIC_COLLECTIONS',
				variables: { limit },
			});
		}
	}

	static async fetchCollectionsOrBundlesByTitleOrId(
		isCollection: boolean,
		titleOrId: string,
		limit: number
	): Promise<Collection[]> {
		try {
			const isUuidFormat = isUuid(titleOrId);
			const variables: Partial<
				GetPublicCollectionsByIdQueryVariables | GetPublicCollectionsByTitleQueryVariables
			> = {
				limit,
				typeId: isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
			};
			if (isUuidFormat) {
				(variables as GetPublicCollectionsByIdQueryVariables).id = titleOrId;
			} else {
				(variables as GetPublicCollectionsByTitleQueryVariables).title = `%${titleOrId}%`;
			}

			const response = await dataService.query<
				GetPublicCollectionsByIdQuery | GetPublicCollectionsByTitleQuery
			>({
				query: isUuidFormat
					? GetPublicCollectionsByIdDocument
					: GetPublicCollectionsByTitleDocument,
				variables,
			});
			return response.app_collections;
		} catch (err) {
			throw new CustomError('Failed to fetch collections or bundles', err, {
				query: 'GET_PUBLIC_COLLECTIONS_BY_ID or GET_PUBLIC_COLLECTIONS_BY_TITLE',
				variables: { titleOrId, isCollection, limit },
			});
		}
	}

	/**
	 * Retrieve collections by title.
	 *
	 * @param titleOrId Keyword to search for collection title or the collection id
	 * @param limit Numeric value to define the maximum amount of items in response.
	 *
	 * @returns Collections limited by `limit`, found using the `title` wildcarded keyword.
	 */
	static async fetchCollectionsByTitleOrId(
		titleOrId: string,
		limit: number
	): Promise<Collection[]> {
		return CollectionService.fetchCollectionsOrBundlesByTitleOrId(true, titleOrId, limit);
	}

	/**
	 * Retrieve bundles by title.
	 *
	 * @param titleOrId Keyword to search for bundle title.
	 * @param limit Numeric value to define the maximum amount of items in response.
	 *
	 * @returns Bundles limited by `limit`, found using the `title` wildcarded keyword.
	 */
	static async fetchBundlesByTitleOrId(titleOrId: string, limit: number): Promise<Collection[]> {
		return CollectionService.fetchCollectionsOrBundlesByTitleOrId(false, titleOrId, limit);
	}

	static async fetchQualityLabels(): Promise<QualityLabel[]> {
		try {
			const response = await dataService.query<GetQualityLabelsQuery>({
				query: GetQualityLabelsDocument,
			});

			return response.lookup_enum_collection_labels as QualityLabel[];
		} catch (err) {
			throw new CustomError('Failed to get quality labels', err, {
				query: 'GET_QUALITY_LABELS',
			});
		}
	}

	/**
	 * Retrieve collections or bundles by user.
	 *
	 * @param type Type of which items should be fetched.
	 * @param user User object defining the owner fo the collection or bundle.
	 *
	 * @returns Collections or bundles owned by the user.
	 */
	static async fetchCollectionsOrBundlesByUser(
		type: 'collection' | 'bundle',
		user: Avo.User.User | undefined
	): Promise<Partial<Avo.Collection.Collection>[]> {
		try {
			// retrieve collections or bundles according to given type and user
			const variables:
				| GetCollectionTitlesByOwnerQueryVariables
				| GetBundleTitlesByOwnerQueryVariables = { owner_profile_id: getProfileId(user) };

			const response = await dataService.query<
				GetCollectionTitlesByOwnerQuery | GetBundleTitlesByOwnerQuery
			>({
				query:
					type === 'collection'
						? GetCollectionTitlesByOwnerDocument
						: GetBundleTitlesByOwnerDocument,
				variables,
			});

			return response.app_collections;
		} catch (err) {
			throw new CustomError('Failed to fetch existing bundle titles by owner', err, {
				user,
				type,
				query:
					type === 'collection'
						? 'GET_COLLECTION_TITLES_BY_OWNER'
						: 'GET_BUNDLE_TITLES_BY_OWNER',
			});
		}
	}

	/**
	 * Retrieve collection or bundle and underlying items or collections by id.
	 *
	 * @param collectionId Unique id of the collection that must be fetched.
	 * @param type Type of which items should be fetched.
	 * @returns Collection or bundle.
	 */
	public static async fetchCollectionOrBundleById(
		collectionId: string,
		type: 'collection' | 'bundle'
	): Promise<Avo.Collection.Collection | null> {
		try {
			return fetchWithLogoutJson(
				`${getEnv('PROXY_URL')}/collections/fetch-with-items-by-id?${queryString.stringify({
					type,
					id: collectionId,
				})}`
			);
		} catch (err) {
			if (JSON.stringify(err).includes('COLLECTION_NOT_FOUND')) {
				return null;
			}
			throw new CustomError('Failed to get collection or bundle with items', err, {
				collectionId,
				type,
			});
		}
	}

	static async getPublishedBundlesContainingCollection(
		id: string
	): Promise<Avo.Collection.Collection[]> {
		const response = await dataService.query<GetPublishedBundlesContainingCollectionQuery>({
			query: GetPublishedBundlesContainingCollectionDocument,
			variables: { id },
		});

		return response.app_collections as Avo.Collection.Collection[];
	}

	static async insertFragments(
		collectionId: string,
		fragments: Partial<Avo.Collection.Fragment>[]
	): Promise<Avo.Collection.Fragment[]> {
		try {
			const cleanedFragments = cloneDeep(fragments).map((fragment) => {
				delete (fragment as any).__typename;
				delete fragment.item_meta;

				return {
					...fragment,
					collection_uuid: collectionId,
					id: undefined,
				};
			});

			const variables: InsertCollectionFragmentsMutationVariables = {
				fragments: cleanedFragments,
			};
			const response = await dataService.query<InsertCollectionFragmentsMutation>({
				query: InsertCollectionFragmentsDocument,
				variables,
			});

			const fragmentIds = response.insert_app_collection_fragments?.returning;
			if (!fragmentIds) {
				throw new CustomError('Response does not contain any fragment ids', null, {
					response,
				});
			}
			(response.insert_app_collection_fragments?.returning ?? []).forEach(
				(f: { id: number }, index: number) => {
					fragments[index].id = f.id;
				}
			);

			return fragments as Avo.Collection.Fragment[];
		} catch (err) {
			throw new CustomError('Failed to insert fragments into collection', err, {
				collectionId,
				fragments,
				query: 'INSERT_COLLECTION_FRAGMENTS',
			});
		}
	}

	private static async getThumbnailPathForCollection(
		collection: Partial<Avo.Collection.Collection>
	): Promise<string | null> {
		try {
			// TODO: check if thumbnail was automatically selected from the first media fragment => need to update every save
			// or if the thumbnail was selected by the user => need to update only if video is not available anymore
			// This will need a new field in the database: thumbnail_type = 'auto' | 'chosen' | 'uploaded'
			// TODO:  || collection.thumbnail_type === 'auto'
			if (!collection.thumbnail_path) {
				return await VideoStillService.getThumbnailForCollection(collection);
			}

			return collection.thumbnail_path;
		} catch (err) {
			const customError = new CustomError(
				'Failed to get the thumbnail path for collection',
				err,
				{
					collection,
				}
			);
			console.error(customError);

			ToastService.danger([
				tHtml(
					'collection/collection___het-ophalen-van-de-eerste-video-thumbnail-is-mislukt'
				),
				tHtml(
					'collection/collection___de-collectie-zal-opgeslagen-worden-zonder-thumbnail'
				),
			]);

			return null;
		}
	}

	/**
	 * Find name that isn't a duplicate of an existing name of a collection of this user
	 * e.g. if these collections exist:
	 * copy 1: test
	 * copy 2: test
	 * copy 4: test
	 *
	 * Then the algorithm will propose: copy 3: test
	 * @param copyPrefix
	 * @param copyRegex
	 * @param existingTitle
	 * @param user
	 *
	 * @returns Potential title for duplicate collection.
	 */
	static getCopyTitleForCollection = async (
		copyPrefix: string,
		copyRegex: RegExp,
		existingTitle: string,
		user: Avo.User.User
	): Promise<string> => {
		const collections = await CollectionService.fetchCollectionsOrBundlesByUser(
			'collection',
			user
		);
		const titles = collections.map((c) => c.title);

		let index = 0;
		let candidateTitle: string;
		const titleWithoutCopy = existingTitle.replace(copyRegex, '');

		do {
			index += 1;
			candidateTitle = copyPrefix.replace('%index%', String(index)) + titleWithoutCopy;
		} while (titles.includes(candidateTitle));

		return candidateTitle;
	};

	static async addLabelsToCollection(collectionId: string, labels: string[]): Promise<void> {
		let variables: InsertCollectionLabelsMutationVariables | undefined = undefined;
		try {
			variables = {
				objects: labels.map((label) => ({
					label,
					collection_uuid: collectionId,
				})),
			};
			await dataService.query<InsertCollectionLabelsMutation>({
				query: InsertCollectionLabelsDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to insert collection labels in the database', err, {
				variables,
				query: 'INSERT_COLLECTION_LABELS',
			});
		}
	}

	static async deleteLabelsFromCollection(collectionId: string, labels: string[]): Promise<void> {
		let variables: DeleteCollectionLabelsMutationVariables | undefined = undefined;
		try {
			variables = {
				collectionId,
				labels,
			};
			await dataService.query<DeleteCollectionLabelsMutation>({
				query: DeleteCollectionLabelsDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to delete collection labels from the database', err, {
				variables,
				query: 'DELETE_COLLECTION_LABELS',
			});
		}
	}

	// TODO investigate why this isn't used anymore
	static async getCollectionLabels(): Promise<{ [id: string]: string }> {
		try {
			if (!CollectionService.collectionLabels) {
				// Fetch collection labels and cache them in memory

				const labels: QualityLabel[] = (await CollectionService.fetchQualityLabels()) || [];

				// Map result array to dictionary
				CollectionService.collectionLabels = fromPairs(
					labels.map((collectionLabel) => [
						collectionLabel.value,
						collectionLabel.description,
					])
				);
			}

			return CollectionService.collectionLabels;
		} catch (err) {
			throw new CustomError('Failed to get collection labels', err, {
				query: 'GET_COLLECTION_LABELS',
			});
		}
	}

	static async getCollectionByTitleOrDescription(
		title: string,
		description: string | null,
		collectionId: string,
		typeId: ContentTypeNumber
	): Promise<{ byTitle: boolean; byDescription: boolean }> {
		try {
			const response = await dataService.query<GetCollectionByTitleOrDescriptionQuery>({
				query: GetCollectionByTitleOrDescriptionDocument,
				variables: { title, description, collectionId, typeId },
			});

			const collectionWithSameTitleExists = !!(response.collectionByTitle || []).length;

			const collectionWithSameDescriptionExists = !!(response.collectionByDescription || [])
				.length;

			return {
				byTitle: collectionWithSameTitleExists,
				byDescription: collectionWithSameDescriptionExists,
			};
		} catch (err) {
			throw new CustomError(
				'Failed to get duplicate collections by title or description',
				err,
				{
					title,
					description,
					query: 'GET_COLLECTION_BY_TITLE_OR_DESCRIPTION',
				}
			);
		}
	}

	static async fetchCollectionsByFragmentId(
		fragmentId: string
	): Promise<Avo.Collection.Collection[]> {
		try {
			// retrieve collections
			const response = await dataService.query<GetCollectionsByItemUuidQuery>({
				query: GetCollectionsByItemUuidDocument,
				variables: { fragmentId },
			});

			return response.app_collections as Avo.Collection.Collection[];
		} catch (err) {
			throw new CustomError('Fetch collections by fragment id failed', err, {
				query: 'GET_COLLECTIONS_BY_ITEM_UUID',
				variables: { fragmentId },
			});
		}
	}

	static async fetchCollectionsByOwner(
		user: Avo.User.User,
		offset: number,
		limit: number | null,
		order: Record<string, 'asc' | 'desc'> | Record<string, 'asc' | 'desc'>[],
		contentTypeId: ContentTypeNumber.collection | ContentTypeNumber.bundle,
		filterString: string | undefined
	): Promise<Avo.Collection.Collection[]> {
		let variables: GetCollectionsByOwnerQueryVariables | null = null;
		try {
			const trimmedFilterString = filterString && filterString.trim();
			const filterArray: any[] = [];
			if (trimmedFilterString) {
				filterArray.push({
					title: { _ilike: `%${trimmedFilterString}%` },
				});
			}
			variables = {
				offset,
				limit,
				order,
				type_id: contentTypeId,
				owner_profile_id: getProfileId(user),
				where: filterArray.length ? filterArray : {},
			};
			const response = await dataService.query<GetCollectionsByOwnerQuery>({
				query: GetCollectionsByOwnerDocument,
				variables,
			});

			return response.app_collections as unknown as Avo.Collection.Collection[];
		} catch (err) {
			throw new CustomError('Fetch collections by fragment id failed', err, {
				variables,
				query: 'GET_COLLECTIONS_BY_OWNER',
			});
		}
	}

	static async fetchBookmarkedCollectionsByOwner(
		user: Avo.User.User,
		offset: number,
		limit: number | null,
		order: GetBookmarkedCollectionsByOwnerQueryVariables['order'],
		filterString: string | undefined
	): Promise<Avo.Collection.Collection[]> {
		let variables: GetBookmarkedCollectionsByOwnerQueryVariables | undefined = undefined;
		try {
			const trimmedFilterString = filterString?.trim();
			const filterArray: GetBookmarkedCollectionsByOwnerQueryVariables['where'] = [];
			if (trimmedFilterString) {
				filterArray.push({
					bookmarkedCollection: { title: { _ilike: `%${trimmedFilterString}%` } },
				});
			}
			variables = {
				offset,
				limit,
				order,
				owner_profile_id: getProfileId(user),
				where: filterArray.length ? filterArray : {},
			};
			const response = await dataService.query<GetBookmarkedCollectionsByOwnerQuery>({
				query: GetBookmarkedCollectionsByOwnerDocument,
				variables,
			});

			const bookmarks = response?.app_collection_bookmarks || [];
			return compact(bookmarks.map((bookmark: any) => bookmark.bookmarkedCollection)); // bookmarkedCollection can sometimes be null apparently
		} catch (err) {
			throw new CustomError('Fetch bookmarked collections by owner failed', err, {
				variables,
				query: 'GET_BOOKMARKED_COLLECTIONS_BY_OWNER',
			});
		}
	}

	static async fetchUuidByAvo1Id(avo1Id: string): Promise<string | null> {
		try {
			const json = await fetchWithLogoutJson<{ uuid: string } | null>(
				`${getEnv('PROXY_URL')}/collections/fetch-uuid-by-avo1-id?${queryString.stringify({
					id: avo1Id,
				})}`
			);

			return json?.uuid || null;
		} catch (err) {
			throw new CustomError('Failed to get collection or bundle uuid by avo1 id', err, {
				avo1Id,
			});
		}
	}

	static async getMarcomEntries(collectionUuid: string): Promise<MarcomEntry[]> {
		let variables: GetCollectionMarcomEntriesQueryVariables | undefined = undefined;
		try {
			variables = {
				collectionUuid,
			};
			const response = await dataService.query<GetCollectionMarcomEntriesQuery>({
				query: GetCollectionMarcomEntriesDocument,
				variables,
			});

			return response.app_collection_marcom_log || [];
		} catch (err) {
			throw new CustomError(
				'Fetch collections marcom entries from the database failed',
				err,
				{
					variables,
					query: 'GET_MARCOM_ENTRIES',
				}
			);
		}
	}

	static async insertMarcomEntry(
		marcomEntries: App_Collection_Marcom_Log_Insert_Input[]
	): Promise<void> {
		let variables: InsertMarcomEntryMutationVariables | undefined = undefined;
		try {
			variables = {
				objects: marcomEntries,
			};
			await dataService.query<InsertMarcomEntryMutation>({
				query: InsertMarcomEntryDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to insert marcom entry into the database', err, {
				variables,
				query: 'INSERT_MARCOM_ENTRY',
			});
		}
	}

	static async insertMarcomEntriesForBundleCollections(
		parentCollectionId: string,
		collectionIds: string[],
		marcomEntry: App_Collection_Marcom_Log_Insert_Input
	): Promise<void> {
		const allEntries = collectionIds.map((collectionId) => ({
			...marcomEntry,
			collection_id: collectionId,
			parent_collection_id: parentCollectionId,
		}));

		await this.insertMarcomEntry(allEntries);
	}

	static async deleteMarcomEntryById(id: number): Promise<void> {
		try {
			const variables: DeleteMarcomEntryMutationVariables = {
				id,
			};
			await dataService.query<DeleteMarcomEntryMutation>({
				query: DeleteMarcomEntryDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError('Failed to delete marcom entry from the database', err, {
				id,
				query: 'DELETE_MARCOM_ENTRY',
			});
		}
	}

	static async deleteMarcomEntryByParentId(marcomEntry: Partial<MarcomEntry>): Promise<void> {
		try {
			if (!marcomEntry.publish_date) {
				return; // Can't delete entries without a date
			}
			const variables: DeleteMarcomEntriesByParentCollectionIdMutationVariables = {
				parentCollectionId: marcomEntry.collection_id,
				channelName: marcomEntry.channel_name,
				channelType: marcomEntry.channel_type,
				publishDateGte: startOfDay(new Date(marcomEntry.publish_date)),
				publishDateLte: endOfDay(new Date(marcomEntry.publish_date)),
			};
			await dataService.query<DeleteMarcomEntriesByParentCollectionIdMutation>({
				query: DeleteMarcomEntriesByParentCollectionIdDocument,
				variables,
			});
		} catch (err) {
			throw new CustomError(
				'Failed to delete marcom entries by parent collection uuid from the database',
				err,
				{
					marcomEntry,
					query: 'DELETE_MARCOM_ENTRIES_BY_PARENT_COLLECTION_ID',
				}
			);
		}
	}

	static async insertMarcomNote(collectionId: string, note: string): Promise<number | undefined> {
		let variables: InsertMarcomNoteMutationVariables | null = null;
		try {
			variables = {
				collectionId,
				note,
			};
			const response = await dataService.query<InsertMarcomNoteMutation>({
				variables,
				query: InsertMarcomNoteDocument,
			});

			return response?.insert_app_collection_marcom_notes?.returning?.[0]?.id;
		} catch (err) {
			throw new CustomError('Failed to insert marcom note into the database', err, {
				query: 'INSERT_MARCOM_NOTE',
				variables,
			});
		}
	}

	static async updateMarcomNote(id: string, note: string): Promise<void> {
		let variables: any;
		try {
			variables = {
				id,
				note,
			};
			await dataService.query<UpdateMarcomNoteMutation>({
				variables,
				query: UpdateMarcomNoteDocument,
			});
		} catch (err) {
			throw new CustomError('Failed to update marcom note in the database', err, {
				variables,
				query: 'UPDATE_MARCOM_NOTE',
			});
		}
	}
}
