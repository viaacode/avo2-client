import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, eq, get, omit, without } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { Prompt, RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	Container,
	DropdownButton,
	DropdownContent,
	Flex,
	Icon,
	MenuContent,
	MetaData,
	MetaDataItem,
	Navbar,
	Spacer,
	Tabs,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { MAX_SEARCH_DESCRIPTION_LENGTH, RouteParts } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import DeleteObjectModal from '../../shared/components/modals/DeleteObjectModal';
import InputModal from '../../shared/components/modals/InputModal';
import { renderAvatar } from '../../shared/helpers/formatters/avatar';
import { ApolloCacheManager } from '../../shared/services/data-service';
import { getThumbnailForCollection } from '../../shared/services/stills-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { IconName } from '../../shared/types/types';
import { ReorderCollectionModal, ShareCollectionModal } from '../components';
import {
	DELETE_COLLECTION,
	DELETE_COLLECTION_FRAGMENT,
	GET_COLLECTION_BY_ID,
	INSERT_COLLECTION_FRAGMENT,
	UPDATE_COLLECTION,
	UPDATE_COLLECTION_FRAGMENT,
} from '../graphql';
import { getValidationErrorForSave, getValidationErrorsForPublish } from '../helpers/validation';
import CollectionEditContent from './CollectionEditContent';
import CollectionEditMetaData from './CollectionEditMetaData';

interface CollectionEditProps extends RouteComponentProps {}

let currentCollection: Avo.Collection.Collection | undefined;
let setCurrentCollection: (collection: Avo.Collection.Collection) => void;

const CollectionEdit: FunctionComponent<CollectionEditProps> = props => {
	const [collectionId] = useState<string | undefined>((props.match.params as any)['id']);
	const [currentTab, setCurrentTab] = useState<string>('inhoud');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [initialCollection, setInitialCollection] = useState<Avo.Collection.Collection>();
	const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
	const [isSavingCollection, setIsSavingCollection] = useState<boolean>(false);

	[currentCollection, setCurrentCollection] = useState<Avo.Collection.Collection | undefined>(
		undefined
	);

	const [triggerCollectionUpdate] = useMutation(UPDATE_COLLECTION);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionFragmentDelete] = useMutation(DELETE_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentInsert] = useMutation(INSERT_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentUpdate] = useMutation(UPDATE_COLLECTION_FRAGMENT);

	// Tab navigation
	const tabs = [
		{
			id: 'inhoud',
			label: 'Inhoud',
			active: currentTab === 'inhoud',
			icon: 'collection' as IconName,
		},
		{
			id: 'metadata',
			label: 'Metadata',
			active: currentTab === 'metadata',
			icon: 'file-text' as IconName,
		},
	];

	const onUnload = (event: any) => {
		if (hasUnsavedChanged()) {
			// Cancel the event as stated by the standard.
			event.preventDefault();

			// Chrome requires returnValue to be set.
			event.returnValue = '';
		}
	};

	useEffect(() => {
		// Register listener once when the component loads
		window.addEventListener('beforeunload', onUnload);

		// Remove listener when the component unloads
		return () => window.removeEventListener('beforeunload', onUnload);
	});

	// Change page on tab selection
	const selectTab = (selectedTab: ReactText) => {
		setCurrentTab(String(selectedTab));
	};

	// Collection methods
	const onRenameCollection = () => {
		setIsOptionsMenuOpen(false);
		setIsRenameModalOpen(true);
	};

	const onDeleteCollection = () => {
		setIsOptionsMenuOpen(false);
		setIsDeleteModalOpen(true);
	};

	const onPreviewCollection = () => {};

	const deleteCollection = async () => {
		try {
			if (!currentCollection) {
				console.error('Failed to delete collection since currentCollection is undefined');
				toastService('Het verwijderen van de collectie is mislukt (collectie niet ingesteld)');
				return;
			}
			await triggerCollectionDelete({
				variables: {
					id: currentCollection.id,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			// TODO: Refresh data on Collections page.
			props.history.push(`/${RouteParts.MyWorkspace}/${RouteParts.Collections}`);
		} catch (err) {
			console.error(err);
			toastService('Het verwijderen van de collectie is mislukt');
		}
	};

	// Update individual property of fragment
	const updateFragmentProperty = (value: any, propertyName: string, fragmentId: number) => {
		const tempCollection: Avo.Collection.Collection | undefined = cloneDeep(currentCollection);

		if (!tempCollection) {
			toastService(
				'De collectie updaten is mislukt, kon geen kopie maken van de bestaande collectie',
				TOAST_TYPE.DANGER
			);
			return;
		}

		const fragmentToUpdate = tempCollection.collection_fragments.find(
			(item: Avo.Collection.Fragment) => item.id === fragmentId
		);

		(fragmentToUpdate as any)[propertyName] = value;

		setCurrentCollection(tempCollection);
	};

	// Update individual property of collection
	const updateCollectionProperty = (value: any, fieldName: string) => {
		setCurrentCollection({
			...currentCollection,
			[fieldName]: value,
		} as Avo.Collection.Collection);
	};

	const renameCollection = async (newTitle: string) => {
		try {
			if (!initialCollection) {
				toastService('De collectie naam kon niet geupdate worden (collectie is niet gedefinieerd)');
				return;
			}
			// Update the name in the current collection
			updateCollectionProperty(newTitle, 'title');

			const collectionWithNewName = {
				...initialCollection,
				title: newTitle,
			};
			// Update the name in the initial collection
			setInitialCollection(collectionWithNewName);
			const cleanedCollection = cleanCollectionBeforeSave(collectionWithNewName);

			// Immediately store the new name, without the user having to click the save button twice
			await triggerCollectionUpdate({
				variables: {
					id: cleanedCollection.id,
					collection: cleanedCollection,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});
		} catch (err) {
			console.error(err);
			toastService('Het hernoemen van de collectie is mislukt');
		}
	};

	const getFragments = (collection: Avo.Collection.Collection | null | undefined) => {
		return get(collection, 'collection_fragments') || [];
	};

	// Swap position of two fragments within a collection
	const swapFragments = (currentId: number, direction: 'up' | 'down') => {
		if (!currentCollection) {
			toastService('De collectie was niet ingesteld', TOAST_TYPE.DANGER);
			return;
		}

		if (!currentCollection.collection_fragments || !currentCollection.collection_fragments.length) {
			toastService('De collectie fragmenten zijn niet ingesteld', TOAST_TYPE.DANGER);
			return;
		}

		const fragments = getFragments(currentCollection);

		const changeFragmentsPositions = (fragments: Avo.Collection.Fragment[], sign: number) => {
			const fragment = fragments.find(
				(fragment: Avo.Collection.Fragment) => fragment.position === currentId
			);

			const otherFragment = fragments.find(
				(fragment: Avo.Collection.Fragment) => fragment.position === currentId - sign
			);

			if (!fragment) {
				toastService(`Het fragment met id ${currentId} is niet gevonden`, TOAST_TYPE.DANGER);
				return;
			}

			if (!otherFragment) {
				toastService(`Het fragment met id ${currentId - sign} is niet gevonden`, TOAST_TYPE.DANGER);
				return;
			}

			fragment.position -= sign;
			otherFragment.position += sign;
		};

		direction === 'up'
			? changeFragmentsPositions(fragments, 1)
			: changeFragmentsPositions(fragments, -1);

		setCurrentCollection({
			...currentCollection,
			collection_fragments: fragments,
		});
	};

	const insertFragment = async (tempId: number, currentFragments: Avo.Collection.Fragment[]) => {
		if (!currentCollection) {
			toastService('De collectie was niet ingesteld', TOAST_TYPE.DANGER);
			return;
		}

		const tempFragment = currentFragments.find(
			(fragment: Avo.Collection.Fragment) => fragment.id === tempId
		);

		if (!tempFragment) {
			toastService(`Fragment om toe te voegen is niet gevonden (id: ${tempId})`);
			return;
		}

		const fragmentToAdd: Avo.Collection.Fragment = { ...tempFragment };
		const oldId = fragmentToAdd.id;

		delete fragmentToAdd.id;
		delete (fragmentToAdd as any).__typename;
		// TODO remove type cast when next typings repo version is released (1.8.0)
		delete (fragmentToAdd as any).item_meta;

		const response = await triggerCollectionFragmentInsert({
			variables: {
				id: currentCollection.id,
				fragment: fragmentToAdd,
			},
			update: ApolloCacheManager.clearCollectionCache,
		});

		const newFragment = get(response, 'data.insert_app_collection_fragments.returning[0]');

		return {
			newFragment,
			oldId,
		};
	};

	const getFragmentIdsFromCollection = (
		collection: Avo.Collection.Collection | undefined
	): number[] => {
		return (get(collection, 'collection_fragments') || []).map(
			(fragment: Avo.Collection.Fragment) => fragment.id
		);
	};

	/**
	 * Clean the collection of properties from other tables, properties that can't be saved
	 */
	const cleanCollectionBeforeSave = (
		collection: Partial<Avo.Collection.Collection>
	): Partial<Avo.Collection.Collection> => {
		const propertiesToDelete = [
			'collection_fragments',
			'label_redactie',
			'collection_permissions',
			'__typename',
			'type',
			'profile',
		];

		return omit(collection, propertiesToDelete);
	};

	const getThumbnailPathForCollection = async (
		collection: Partial<Avo.Collection.Collection>
	): Promise<string | null> => {
		try {
			// TODO check if thumbnail was automatically selected from the first media fragment => need to update every save
			// or if the thumbnail was selected by the user => need to update only if video is not available anymore
			// This will need a new field in the database: thumbnail_type = 'auto' | 'chosen' | 'uploaded'
			// TODO  || collection.thumbnail_type === 'auto'
			if (!collection.thumbnail_path) {
				return await getThumbnailForCollection(collection);
			}
			return collection.thumbnail_path;
		} catch (err) {
			console.error('Failed to get the thumbnail path for collection', err, { collection });
			toastService(
				<>
					Het ophalen van de eerste video thumbnail is mislukt.
					<br />
					De collectie zal opgeslagen worden zonder thumbnail.
				</>
			);
			return null;
		}
	};

	async function onSaveCollection(refetchCollection: () => void) {
		try {
			if (!currentCollection) {
				toastService(`De huidige collectie is niet gevonden`, TOAST_TYPE.DANGER);
				return;
			}
			setIsSavingCollection(true);
			// Validate collection before save
			let validationErrors: string[];
			if (currentCollection.is_public) {
				validationErrors = getValidationErrorsForPublish(currentCollection);
			} else {
				validationErrors = getValidationErrorForSave(currentCollection);
			}

			if (validationErrors.length) {
				toastService(validationErrors.join('</br>'), TOAST_TYPE.DANGER);
				setIsSavingCollection(false);
				return;
			}

			let newCollection: Avo.Collection.Collection = cloneDeep(currentCollection);

			// Not using lodash default value parameter since the value an be null and
			// that doesn't default to the default value
			// only undefined defaults to the default value
			const initialFragmentIds: number[] = getFragmentIdsFromCollection(initialCollection);
			const currentFragmentIds: number[] = getFragmentIdsFromCollection(currentCollection);
			const newFragmentIds: number[] = getFragmentIdsFromCollection(newCollection);
			const currentFragments: Avo.Collection.Fragment[] = get(
				currentCollection,
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
				insertPromises.push(insertFragment(tempId, currentFragments));
			});

			// Delete fragments
			const deletePromises: Promise<any>[] = [];

			deleteFragmentIds.forEach((id: number) => {
				deletePromises.push(
					triggerCollectionFragmentDelete({
						variables: { id },
						update: ApolloCacheManager.clearCollectionCache,
					})
				);
			});

			// Update fragments
			const updatePromises: Promise<any>[] = [];
			updateFragmentIds.forEach((id: number) => {
				let fragmentToUpdate: Avo.Collection.Fragment | undefined = getFragments(
					currentCollection
				).find((fragment: Avo.Collection.Fragment) => {
					return Number(id) === fragment.id;
				});

				if (!fragmentToUpdate) {
					toastService(`Kan het te updaten fragment niet vinden (id: ${id})`);
					return;
				}

				fragmentToUpdate = cloneDeep(fragmentToUpdate);

				delete (fragmentToUpdate as any).__typename;
				// TODO remove type cast when next typings repo version is released (1.8.0)
				delete (fragmentToUpdate as any).item_meta;

				updatePromises.push(
					triggerCollectionFragmentUpdate({
						variables: {
							id,
							fragment: fragmentToUpdate,
						},
						update: ApolloCacheManager.clearCollectionCache,
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
					...newCollection.collection_fragments.filter(
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
			newCollection.thumbnail_path = await getThumbnailPathForCollection(newCollection);

			// Trigger collection update
			const cleanedCollection: Partial<Avo.Collection.Collection> = cleanCollectionBeforeSave(
				newCollection
			);
			await triggerCollectionUpdate({
				variables: {
					id: cleanedCollection.id,
					collection: cleanedCollection,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});
			setCurrentCollection(newCollection);
			setInitialCollection(cloneDeep(newCollection));
			setIsSavingCollection(false);
			toastService('Collectie opgeslagen', TOAST_TYPE.SUCCESS);
			// refetch collection:
			refetchCollection();
		} catch (err) {
			console.error(err);
			toastService('Opslaan mislukt', TOAST_TYPE.DANGER);
		}
	}

	const hasUnsavedChanged = () => {
		return JSON.stringify(currentCollection) !== JSON.stringify(initialCollection);
	};

	const handleShareCollectionModalClose = (collection?: Avo.Collection.Collection) => {
		setIsShareModalOpen(false);
		// Update initial and current states, so that the 'hasUnsavedChanged' status is correct
		if (collection) {
			if (currentCollection) {
				setCurrentCollection({
					...currentCollection,
					is_public: collection.is_public,
					publish_at: collection.publish_at,
				});
			}
			if (initialCollection) {
				setInitialCollection({
					...initialCollection,
					is_public: collection.is_public,
					publish_at: collection.publish_at,
				});
			}
		}
	};

	const renderCollectionEdit = (
		collection: Avo.Collection.Collection,
		refetchCollection: () => void
	) => {
		if (!isFirstRender) {
			setCurrentCollection(collection);
			setInitialCollection(cloneDeep(collection)); // Clone so we can keep track of changes deep within the collection
			setIsFirstRender(true);
		}

		return currentCollection ? (
			<>
				<Prompt
					when={hasUnsavedChanged()}
					message="Er zijn nog niet opgeslagen wijzigingen, weet u zeker dat u weg wilt?"
				/>
				<Container background="alt" mode="vertical">
					<Container mode="horizontal">
						<Toolbar autoHeight>
							<ToolbarLeft>
								<ToolbarItem>
									<Spacer margin="bottom">
										<MetaData spaced={true} category="collection">
											<MetaDataItem>
												<div className="c-content-type c-content-type--collection">
													<Icon name="collection" />
													<p>COLLECTION</p>
												</div>
											</MetaDataItem>
											<MetaDataItem
												icon="eye"
												label={String(188) /* TODO currentCollection.view_count */}
											/>
											<MetaDataItem
												icon="bookmark"
												label={String(12) /* TODO currentCollection.bookInhoud_count */}
											/>
										</MetaData>
									</Spacer>
									<h1 className="c-h2 u-clickable" onClick={() => setIsRenameModalOpen(true)}>
										{currentCollection.title}
									</h1>
									{currentCollection.profile && (
										<Flex spaced="regular">
											{renderAvatar(currentCollection.profile, { includeRole: true })}
										</Flex>
									)}
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="c-button-toolbar">
										<Button
											type="secondary"
											label="Delen"
											disabled={hasUnsavedChanged()}
											title={
												!eq(currentCollection, initialCollection)
													? 'U moet uw wijzigingen eerst opslaan'
													: ''
											}
											onClick={() => setIsShareModalOpen(!isShareModalOpen)}
										/>
										<Button
											type="secondary"
											label="Bekijk"
											onClick={onPreviewCollection}
											disabled
										/>
										<Button
											type="secondary"
											label="Herschik alle items"
											onClick={() => setIsReorderModalOpen(!isReorderModalOpen)}
											disabled
										/>
										<ControlledDropdown
											isOpen={isOptionsMenuOpen}
											menuWidth="fit-content"
											onOpen={() => setIsOptionsMenuOpen(true)}
											onClose={() => setIsOptionsMenuOpen(false)}
											placement="bottom-end"
										>
											<DropdownButton>
												<Button type="secondary" icon="more-horizontal" />
											</DropdownButton>
											<DropdownContent>
												<MenuContent
													menuItems={[
														{ icon: 'folder', id: 'rename', label: 'Collectie hernoemen' },
														{ icon: 'delete', id: 'delete', label: 'Verwijder' },
													]}
													onClick={itemId => {
														switch (itemId) {
															case 'rename':
																onRenameCollection();
																break;
															case 'delete':
																onDeleteCollection();
																break;
															default:
																return null;
														}
													}}
												/>
											</DropdownContent>
										</ControlledDropdown>
										<Spacer margin="left-small">
											<Button
												type="primary"
												label="Opslaan"
												onClick={() => onSaveCollection(refetchCollection)}
												disabled={isSavingCollection}
											/>
										</Spacer>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={selectTab} />
					</Container>
				</Navbar>
				{currentTab === 'inhoud' && (
					<CollectionEditContent
						collection={currentCollection}
						swapFragments={swapFragments}
						updateCollection={setCurrentCollection}
						updateFragmentProperty={updateFragmentProperty}
					/>
				)}
				{currentTab === 'metadata' && (
					<CollectionEditMetaData
						collection={currentCollection}
						updateCollectionProperty={updateCollectionProperty}
					/>
				)}
				<ReorderCollectionModal
					isOpen={isReorderModalOpen}
					onClose={() => setIsReorderModalOpen(false)}
				/>
				<ShareCollectionModal
					collection={currentCollection}
					isOpen={isShareModalOpen}
					onClose={handleShareCollectionModalClose}
					updateCollectionProperty={updateCollectionProperty}
				/>
				<DeleteObjectModal
					title={`Ben je zeker dat de collectie "${currentCollection.title}" wil verwijderen?`}
					body="Deze actie kan niet ongedaan gemaakt worden"
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={deleteCollection}
				/>
				<InputModal
					title="Hernoem deze collectie"
					inputLabel="Naam collectie:"
					inputValue={collection.title}
					isOpen={isRenameModalOpen}
					onClose={() => setIsRenameModalOpen(false)}
					inputCallback={renameCollection}
				/>
			</>
		) : null;
	};

	return (
		<DataQueryComponent
			query={GET_COLLECTION_BY_ID}
			variables={{ id: collectionId }}
			resultPath="app_collections[0]"
			renderData={renderCollectionEdit}
			notFoundMessage="Deze collectie werd niet gevonden"
		/>
	);
};

export function getValidationFeedbackForShortDescription(
	collection: Avo.Collection.Collection,
	isError?: boolean | null
): string {
	const count = `${(collection.description || '').length}/${MAX_SEARCH_DESCRIPTION_LENGTH}`;

	const exceedsSize: boolean =
		(collection.description || '').length > MAX_SEARCH_DESCRIPTION_LENGTH;

	if (isError) {
		return exceedsSize ? `De korte omschrijving is te lang. ${count}` : '';
	}

	return exceedsSize
		? ''
		: `${(collection.description || '').length}/${MAX_SEARCH_DESCRIPTION_LENGTH}`;
}

export default withRouter(withApollo(CollectionEdit));
