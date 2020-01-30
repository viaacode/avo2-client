import { ExecutionResult, MutationFunction } from '@apollo/react-common';
import { cloneDeep, compact, get, isNil, omit, without } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { getProfileId } from '../authentication/helpers/get-profile-info';
import { GET_COLLECTIONS_BY_IDS } from '../bundle/bundle.gql';
import { CustomError } from '../shared/helpers';
import { ApolloCacheManager, dataService } from '../shared/services/data-service';
import { getThumbnailForCollection } from '../shared/services/stills-service';
import toastService from '../shared/services/toast-service';
import i18n from '../shared/translations/i18n';
import {
	GET_BUNDLE_TITLES_BY_OWNER,
	GET_BUNDLES_CONTAINING_COLLECTION,
	GET_COLLECTION_BY_ID,
	GET_COLLECTION_TITLES_BY_OWNER,
	GET_COLLECTIONS,
	GET_ITEMS_BY_IDS,
} from './collection.gql';
import { getValidationErrorForSave, getValidationErrorsForPublish } from './collection.helpers';
import { ContentTypeNumber } from './collection.types';

// TODO: Translations in errors.
export class CollectionService {
	public static async insertCollection(
		newCollection: Partial<Avo.Collection.Collection>,
		triggerCollectionInsert: any | undefined, // can be undefined when saving an existing collection
		triggerCollectionFragmentsInsert: any
	): Promise<Avo.Collection.Collection> {
		try {
			newCollection.created_at = new Date().toISOString();
			newCollection.updated_at = newCollection.created_at;
			const cleanedCollection = this.cleanCollectionBeforeSave(newCollection);
			const response: void | ExecutionResult<
				Avo.Collection.Collection
			> = await triggerCollectionInsert({
				variables: {
					collection: cleanedCollection,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			const insertedCollection: Avo.Collection.Collection | null = get(
				response,
				'data.insert_app_collections.returning[0]'
			);

			if (!response || response.errors) {
				throw new CustomError('Failed to create the collection in the database', null, {
					response,
				});
			}
			if (!insertedCollection || isNil(insertedCollection.id)) {
				throw new CustomError(
					'Failed to fetch the newly created collection from the database',
					null,
					{ response }
				);
			}
			newCollection.id = insertedCollection.id;

			const fragments = this.getFragments(newCollection);
			if (fragments && fragments.length) {
				// Insert fragments
				newCollection.collection_fragments = await this.insertFragments(
					newCollection.id,
					fragments,
					triggerCollectionFragmentsInsert
				);
			}

			return newCollection as Avo.Collection.Collection;
		} catch (err) {
			throw new CustomError('Failed to insert collection', err, { newCollection });
		}
	}

	public static async updateCollection(
		initialCollection: Avo.Collection.Collection | null,
		updatedCollection: Avo.Collection.Collection,
		triggerCollectionUpdate: MutationFunction<any>,
		triggerCollectionFragmentInsert: MutationFunction<any>,
		triggerCollectionFragmentDelete: MutationFunction<any>,
		triggerCollectionFragmentUpdate: MutationFunction<any>
	): Promise<Avo.Collection.Collection | null> {
		try {
			if (!updatedCollection) {
				toastService.danger(`De huidige collectie is niet gevonden`);
				return null;
			}
			// Validate collection before save
			let validationErrors: string[];
			if (updatedCollection.is_public) {
				validationErrors = getValidationErrorsForPublish(updatedCollection);
			} else {
				validationErrors = getValidationErrorForSave(updatedCollection);
			}

			if (validationErrors.length) {
				toastService.danger(validationErrors);
				return null;
			}

			let newCollection: Partial<Avo.Collection.Collection> = cloneDeep(updatedCollection);

			// Remove custom_title and custom_description if user wants to use the item's original title and description
			(newCollection.collection_fragments || []).forEach((fragment: Avo.Collection.Fragment) => {
				if (!fragment.use_custom_fields) {
					delete fragment.custom_title;
					delete fragment.custom_description;
				}
			});

			// Not using lodash default value parameter since the value an be null and
			// that doesn't default to the default value
			// only undefined defaults to the default value
			const initialFragmentIds: number[] = this.getFragmentIdsFromCollection(initialCollection);
			const currentFragmentIds: number[] = this.getFragmentIdsFromCollection(updatedCollection);
			const newFragmentIds: number[] = this.getFragmentIdsFromCollection(newCollection);
			const currentFragments: Avo.Collection.Fragment[] = get(
				updatedCollection,
				'collection_fragments',
				[]
			);

			// Insert fragments that added to collection
			const insertFragmentIds = without(newFragmentIds, ...initialFragmentIds);

			// Delete fragments that were removed from collection
			const deleteFragmentIds = without(initialFragmentIds, ...newFragmentIds);

			// Update fragments that are neither inserted nor deleted
			const updateFragmentIds = currentFragmentIds.filter((fragmentId: number) =>
				initialFragmentIds.includes(fragmentId)
			);

			// Insert fragments
			const insertPromises: Promise<any>[] = [];

			insertFragmentIds.forEach(tempId => {
				insertPromises.push(
					this.insertFragment(
						updatedCollection,
						tempId,
						currentFragments,
						triggerCollectionFragmentInsert
					)
				);
			});

			// Delete fragments
			const deletePromises: Promise<any>[] = [];

			deleteFragmentIds.forEach((id: number) => {
				deletePromises.push(
					triggerCollectionFragmentDelete({
						variables: { id },
					})
				);
			});

			// Update fragments
			const updatePromises: Promise<any>[] = [];
			updateFragmentIds.forEach((id: number) => {
				let fragmentToUpdate: Avo.Collection.Fragment | undefined = this.getFragments(
					updatedCollection
				).find((fragment: Avo.Collection.Fragment) => {
					return Number(id) === fragment.id;
				});

				if (!fragmentToUpdate) {
					toastService.info(`Kan het te updaten fragment niet vinden (id: ${id})`);
					return;
				}

				fragmentToUpdate = cloneDeep(fragmentToUpdate);

				delete (fragmentToUpdate as any).__typename;
				delete fragmentToUpdate.item_meta;

				updatePromises.push(
					triggerCollectionFragmentUpdate({
						variables: {
							id,
							fragment: fragmentToUpdate,
						},
					})
				);
			});

			// Make all crud requests in parallel
			const crudPromises: Promise<any[]>[] = [
				Promise.all(insertPromises),
				Promise.all(deletePromises),
				Promise.all(updatePromises),
			];

			const crudResponses = await Promise.all(crudPromises);

			// Process new fragments responses
			crudResponses[0].forEach((data: any) => {
				const newFragments = [
					...this.getFragments(newCollection).filter(
						(fragment: Avo.Collection.Fragment) => fragment.id !== data.oldId
					),
					data.newFragment,
				];
				newCollection = {
					...newCollection,
					collection_fragments: newFragments,
				};
			});

			if (newCollection.type_id === ContentTypeNumber.collection) {
				// Determine new thumbnail path since videos could have changed order / been deleted
				newCollection.thumbnail_path = await this.getThumbnailPathForCollection(newCollection);
			}

			// Trigger collection update
			const cleanedCollection: Partial<Avo.Collection.Collection> = this.cleanCollectionBeforeSave(
				newCollection
			);

			await triggerCollectionUpdate({
				variables: {
					id: cleanedCollection.id,
					collection: cleanedCollection,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			return newCollection as Avo.Collection.Collection;
		} catch (err) {
			console.error('Failed to update collection or its fragments', err, {
				initialCollection,
				updatedCollection,
				triggerCollectionUpdate,
				triggerCollectionFragmentInsert,
				triggerCollectionFragmentDelete,
				triggerCollectionFragmentUpdate,
			});
			return null;
		}
	}

	public static getFragments(
		collection: Partial<Avo.Collection.Collection> | null | undefined
	): Avo.Collection.Fragment[] {
		return get(collection, 'collection_fragments') || [];
	}

	/**
	 * Find name that isn't a duplicate of an existing name of a collection of this user
	 * eg if these collections exist:
	 * copy 1: test
	 * copy 2: test
	 * copy 4: test
	 *
	 * Then the algorithm will propose: copy 3: test
	 * @param copyPrefix
	 * @param copyRegex
	 * @param existingTitle
	 * @param user
	 */
	public static getCopyTitleForCollection = async (
		copyPrefix: string,
		copyRegex: RegExp,
		existingTitle: string,
		user: Avo.User.User
	): Promise<string> => {
		const collections = await CollectionService.getCollectionTitlesByUser('collection', user);
		const titles = collections.map(c => c.title);

		let index = 0;
		let candidateTitle: string;
		const titleWithoutCopy = existingTitle.replace(copyRegex, '');
		do {
			index += 1;
			candidateTitle = copyPrefix.replace('%index%', String(index)) + titleWithoutCopy;
		} while (titles.includes(candidateTitle));

		return candidateTitle;
	};

	public static async duplicateCollection(
		collection: Avo.Collection.Collection,
		user: Avo.User.User,
		copyPrefix: string,
		copyRegex: RegExp,
		triggerCollectionInsert: any,
		triggerCollectionFragmentsInsert: any
	): Promise<Avo.Collection.Collection> {
		const collectionToInsert = { ...collection };
		collectionToInsert.owner_profile_id = getProfileId(user);
		collectionToInsert.is_public = false;
		delete collectionToInsert.id;
		try {
			collectionToInsert.title = await CollectionService.getCopyTitleForCollection(
				copyPrefix,
				copyRegex,
				collectionToInsert.title,
				user
			);
		} catch (err) {
			console.error('Failed to get good copy title for collection', err, { collectionToInsert });
			// Fallback to simple copy title
			collectionToInsert.title = `${copyPrefix.replace(' %index%', '')}${collectionToInsert.title}`;
		}

		return await CollectionService.insertCollection(
			collectionToInsert,
			triggerCollectionInsert,
			triggerCollectionFragmentsInsert
		);
	}

	/**
	 * Clean the collection of properties from other tables, properties that can't be saved
	 */
	public static cleanCollectionBeforeSave(
		collection: Partial<Avo.Collection.Collection>
	): Partial<Avo.Collection.Collection> {
		const propertiesToDelete = [
			'collection_fragments',
			'label_redactie',
			'__typename',
			'type',
			'profile',
		];

		return omit(collection, propertiesToDelete);
	}

	// TODO: Merge the following two get collections functions.
	public static async getCollections(limit: number): Promise<Avo.Collection.Collection[]> {
		try {
			const response = await dataService.query({
				query: GET_COLLECTIONS,
				variables: { limit },
			});

			return get(response, 'data.app_collections', []);
		} catch (err) {
			console.error('Failed to fetch collections.', err);
			throw new CustomError('Het ophalen van de collecties is mislukt.', err);
		}
	}

	public static async getCollectionTitlesByUser(
		type: 'collection' | 'bundle',
		user: Avo.User.User | undefined
	): Promise<Partial<Avo.Collection.Collection>[]> {
		let queryInfo: any;
		try {
			queryInfo = {
				query: type === 'collection' ? GET_COLLECTION_TITLES_BY_OWNER : GET_BUNDLE_TITLES_BY_OWNER,
				variables: { owner_profile_id: getProfileId(user) },
			};
			const response = await dataService.query(queryInfo);
			return get(response, 'data.app_collections', []);
		} catch (err) {
			console.error('Failed to get collection titles by owner', err, queryInfo);
			throw new CustomError('Het ophalen van de bestaande collecties is mislukt', err, {
				user,
			});
		}
	}

	public static async getCollectionWithItems(
		collectionId: string,
		type: 'collection' | 'bundle'
	): Promise<Avo.Collection.Collection | undefined> {
		const response = await dataService.query({
			query: GET_COLLECTION_BY_ID,
			variables: { id: collectionId },
		});

		if (response.errors) {
			throw new CustomError(
				`Failed to  get ${type} from database because of graphql errors`,
				null,
				{
					collectionId,
					errors: response.errors,
				}
			);
		}

		const collectionObj: Avo.Collection.Collection | null = get(
			response,
			'data.app_collections[0]'
		);

		if (!collectionObj) {
			throw new CustomError(`query for ${type} returned empty result`, null, {
				collectionId,
				response,
			});
		}
		// Collection/bundle loaded successfully
		if (collectionObj.type_id !== ContentTypeNumber[type]) {
			return undefined;
		}

		// Get items/collections for each collection_fragment that has an external_id set
		const ids: string[] = compact(
			(collectionObj.collection_fragments || []).map((collectionFragment, index) => {
				// Reset the positions to be a nice list of integers in order
				// The database ensures that they are sorted by their previous position
				collectionFragment.position = index;

				// Return the external id if it is set
				// TODO replace this by a check on collectionFragment.type === 'ITEM' || collectionFragment.type === 'COLLECTION'
				if (collectionFragment.external_id !== '-1') {
					return collectionFragment.external_id;
				}
				return null;
			})
		);
		try {
			const response = await dataService.query({
				query: type === 'collection' ? GET_ITEMS_BY_IDS : GET_COLLECTIONS_BY_IDS,
				variables: { ids },
			});
			// Add infos to each fragment under the item_meta property
			const itemInfos: any[] = get(response, 'data.items', []);
			itemInfos.forEach((itemInfo: any) => {
				const collectionFragment:
					| Avo.Collection.Fragment
					| undefined = collectionObj.collection_fragments.find(
					fragment =>
						fragment.external_id === (type === 'collection' ? itemInfo.external_id : itemInfo.id)
				);
				if (collectionFragment) {
					collectionFragment.item_meta = itemInfo;
					if (!collectionFragment.use_custom_fields) {
						collectionFragment.custom_description = itemInfo.description;
						collectionFragment.custom_title = itemInfo.title;
					}
				}
			});
			return collectionObj;
		} catch (err) {
			throw new CustomError('Failed to get fragments inside the collection', err, { ids });
		}
	}

	public static async getPublishedBundlesContainingCollection(
		id: string
	): Promise<Avo.Collection.Collection[]> {
		const response = await dataService.query({
			query: GET_BUNDLES_CONTAINING_COLLECTION,
			variables: { id },
		});

		if (response.errors) {
			throw new CustomError(
				`Failed to  get bundles from database because of graphql errors`,
				null,
				{
					collectionId: id,
					errors: response.errors,
				}
			);
		}

		return get(response, 'data.app_collections', []);
	}

	private static getFragmentIdsFromCollection(
		collection: Partial<Avo.Collection.Collection> | null
	): number[] {
		return this.getFragments(collection).map((fragment: Avo.Collection.Fragment) => fragment.id);
	}

	private static async insertFragments(
		collectionId: string,
		fragments: Avo.Collection.Fragment[],
		triggerCollectionFragmentsInsert: any
	): Promise<Avo.Collection.Fragment[]> {
		fragments.forEach(fragment => ((fragment as any).collection_uuid = collectionId));
		fragments.forEach(fragment => ((fragment as any).collection_id = '')); // TODO remove once database allows it
		const cleanedFragments = cloneDeep(fragments).map(fragment => {
			delete fragment.id;
			delete (fragment as any).__typename;
			delete fragment.item_meta;
			return fragment;
		});
		const response = await triggerCollectionFragmentsInsert({
			variables: {
				id: collectionId,
				fragments: cleanedFragments,
			},
			update: ApolloCacheManager.clearCollectionCache,
		});
		get(response, 'data.insert_app_collection_fragments.returning', []).forEach(
			(f: { id: number }, index: number) => {
				fragments[index].id = f.id;
			}
		);
		return fragments;
	}

	private static async insertFragment(
		collection: Partial<Avo.Collection.Collection>,
		tempId: number,
		currentFragments: Avo.Collection.Fragment[],
		triggerCollectionFragmentInsert: any
	) {
		if (!collection) {
			toastService.danger(i18n.t('collection/collection___de-collectie-was-niet-ingesteld'));
			return;
		}

		const tempFragment = currentFragments.find(
			(fragment: Avo.Collection.Fragment) => fragment.id === tempId
		);

		if (!tempFragment) {
			toastService.info(
				i18n.t(`Fragment om toe te voegen is niet gevonden (id: {{id}})`, { id: tempId })
			);
			return;
		}

		const fragmentToAdd: Avo.Collection.Fragment = { ...tempFragment };
		const oldId = fragmentToAdd.id;

		delete fragmentToAdd.id;
		delete (fragmentToAdd as any).__typename;
		delete fragmentToAdd.item_meta;

		const response = await triggerCollectionFragmentInsert({
			variables: {
				id: collection.id,
				fragments: fragmentToAdd,
			},
			update: ApolloCacheManager.clearCollectionCache,
		});

		const newFragment = get(response, 'data.insert_app_collection_fragments.returning[0]');

		return {
			newFragment,
			oldId,
		};
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
				return await getThumbnailForCollection(collection);
			}

			return collection.thumbnail_path;
		} catch (err) {
			console.error('Failed to get the thumbnail path for collection', err, { collection });
			toastService.danger([
				i18n.t('collection/collection___het-ophalen-van-de-eerste-video-thumbnail-is-mislukt'),
				i18n.t('collection/collection___de-collectie-zal-opgeslagen-worden-zonder-thumbnail'),
			]);
			return null;
		}
	}
}
