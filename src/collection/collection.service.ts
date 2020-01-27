import { ExecutionResult } from '@apollo/react-common';
import { cloneDeep, compact, get, isNil, omit, without } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { TFunction } from 'i18next';
import { getProfileId } from '../authentication/helpers/get-profile-info';
import { GET_COLLECTIONS_BY_IDS } from '../bundle/bundle.gql';
import { LoadingInfo } from '../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../shared/helpers/error';
import { ApolloCacheManager, dataService } from '../shared/services/data-service';
import { getThumbnailForCollection } from '../shared/services/stills-service';
import toastService from '../shared/services/toast-service';
import {
	GET_BUNDLE_TITLES_BY_OWNER,
	GET_COLLECTION_BY_ID,
	GET_COLLECTION_TITLES_BY_OWNER,
	GET_COLLECTIONS,
	GET_ITEMS_BY_IDS,
} from './collection.gql';
import { getValidationErrorForSave, getValidationErrorsForPublish } from './collection.helpers';

// TODO: Translations in errors.
export class CollectionService {
	public static async insertCollection(
		newCollection: Partial<Avo.Collection.Collection>,
		triggerCollectionInsert: any | undefined, // can be undefined when saving an existing collection
		triggerCollectionFragmentsInsert: any
	): Promise<Avo.Collection.Collection | null> {
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
				toastService.danger('De collectie kon niet worden aangemaakt');
				return null;
			}
			if (!insertedCollection || isNil(insertedCollection.id)) {
				toastService.danger('De aangemaakte collectie kon niet worden opgehaald');
				return null;
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
			console.error('Failed to insert collection', err, { newCollection });
			return null;
		}
	}

	public static async updateCollection(
		initialCollection: Avo.Collection.Collection | undefined,
		updatedCollection: Avo.Collection.Collection,
		triggerCollectionUpdate: any,
		triggerCollectionFragmentInsert: any,
		triggerCollectionFragmentDelete: any,
		triggerCollectionFragmentUpdate: any,
		refetchCollection: () => void
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
					collection_fragment_ids: newFragments.map(fragment => fragment.id),
					collection_fragments: newFragments,
				};
			});

			// Determine new thumbnail path since videos could have changed order / been deleted
			newCollection.thumbnail_path = await this.getThumbnailPathForCollection(newCollection);

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

			// refetch collection:
			refetchCollection();
			return newCollection as Avo.Collection.Collection;
		} catch (err) {
			console.error('Failed to update collection or its fragments', err, {
				initialCollection,
				updatedCollection,
				triggerCollectionUpdate,
				triggerCollectionFragmentInsert,
				triggerCollectionFragmentDelete,
				triggerCollectionFragmentUpdate,
				refetchCollection,
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
		type: 'collection' | 'bundle',
		setLoadingInfo: (info: LoadingInfo) => void,
		t: TFunction
	): Promise<Avo.Collection.Collection | undefined> {
		const response = await dataService.query({
			query: GET_COLLECTION_BY_ID,
			variables: { id: collectionId },
		});

		if (response.errors) {
			console.error(
				new CustomError(`Failed to  get ${type} from database`, null, {
					collectionId,
					errors: response.errors,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('Het ophalen van de {{collectionOrBundle}} is mislukt', {
					collectionOrBundle: type === 'collection' ? t('collectie') : t('bundel'),
				}),
				icon: 'alert-triangle',
			});
		}

		const collectionObj: Avo.Collection.Collection | null = get(
			response,
			'data.app_collections[0]'
		);

		if (!collectionObj) {
			console.error(`query for ${type} returned empty result`, null, {
				collectionId,
				response,
			});
			setLoadingInfo({
				state: 'error',
				message: t('Deze {{collectionOrBundle}} werd niet gevonden', {
					collectionOrBundle: type === 'collection' ? t('collectie') : t('bundel'),
				}),
				icon: 'search',
			});
		} else {
			// Collection/bundle loaded successfully
			// Get items/collections for each collection_fragment that has an external_id set
			const ids: string[] = compact(
				(collectionObj.collection_fragments || []).map(
					(collectionFragment: Avo.Collection.Fragment) => {
						if (collectionFragment.external_id !== '-1') {
							return collectionFragment.external_id;
						}
						return null;
					}
				)
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
							fragment.external_id ===
							String(type === 'collection' ? itemInfo.external_id : itemInfo.id)
					);
					if (collectionFragment) {
						collectionFragment.item_meta = itemInfo;
					}
				});
				return collectionObj;
			} catch (err) {
				throw new CustomError('Failed to get fragments inside the collection', err, { ids });
			}
		}
	}

	private static getFragmentIdsFromCollection(
		collection: Partial<Avo.Collection.Collection> | undefined
	): number[] {
		return this.getFragments(collection).map((fragment: Avo.Collection.Fragment) => fragment.id);
	}

	private static async insertFragments(
		collectionId: number,
		fragments: Avo.Collection.Fragment[],
		triggerCollectionFragmentsInsert: any
	): Promise<Avo.Collection.Fragment[]> {
		fragments.forEach(fragment => (fragment.collection_id = collectionId));
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
			toastService.danger('De collectie was niet ingesteld');
			return;
		}

		const tempFragment = currentFragments.find(
			(fragment: Avo.Collection.Fragment) => fragment.id === tempId
		);

		if (!tempFragment) {
			toastService.info(`Fragment om toe te voegen is niet gevonden (id: ${tempId})`);
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
				'Het ophalen van de eerste video thumbnail is mislukt.',
				'De collectie zal opgeslagen worden zonder thumbnail.',
			]);
			return null;
		}
	}
}
