import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, eq } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { Prompt, RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	ButtonToolbar,
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

import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { MAX_SEARCH_DESCRIPTION_LENGTH, RouteParts } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import DeleteObjectModal from '../../shared/components/modals/DeleteObjectModal';
import InputModal from '../../shared/components/modals/InputModal';
import { renderAvatar } from '../../shared/helpers/formatters/avatar';
import { ApolloCacheManager } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { ReorderCollectionModal, ShareCollectionModal } from '../components';
import { FragmentPropertyUpdateInfo } from '../components/modals/CutFragmentModal';
import { COLLECTION_EDIT_TABS } from '../constants';
import {
	DELETE_COLLECTION,
	DELETE_COLLECTION_FRAGMENT,
	GET_COLLECTION_BY_ID,
	INSERT_COLLECTION_FRAGMENTS,
	UPDATE_COLLECTION,
	UPDATE_COLLECTION_FRAGMENT,
} from '../graphql';
import { CollectionService } from '../service';
import { Tab } from '../types';
import CollectionEditContent from './CollectionEditContent';
import CollectionEditMetaData from './CollectionEditMetaData';

interface CollectionEditProps extends RouteComponentProps {}

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

	const [currentCollection, setCurrentCollection] = useState<Avo.Collection.Collection | undefined>(
		undefined
	);

	const [triggerCollectionUpdate] = useMutation(UPDATE_COLLECTION);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionFragmentDelete] = useMutation(DELETE_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);
	const [triggerCollectionFragmentUpdate] = useMutation(UPDATE_COLLECTION_FRAGMENT);

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

			trackEvents({
				event_object: {
					type: 'collection',
					identifier: String(currentCollection.id),
				},
				event_message: `Gebruiker ${getProfileName()} heeft de collectie ${
					currentCollection.id
				} verwijderd`,
				name: 'delete',
				category: 'item',
			});

			props.history.push(`/${RouteParts.MyWorkspace}/${RouteParts.Collections}`);
		} catch (err) {
			console.error(err);
			toastService('Het verwijderen van de collectie is mislukt');
		}
	};

	// Update individual property of fragment
	const updateFragmentProperties = (updateInfos: FragmentPropertyUpdateInfo[]) => {
		const tempCollection: Avo.Collection.Collection | undefined = cloneDeep(currentCollection);

		if (!tempCollection) {
			toastService(
				'De collectie updaten is mislukt, kon geen kopie maken van de bestaande collectie',
				TOAST_TYPE.DANGER
			);
			return;
		}

		updateInfos.forEach((updateInfo: FragmentPropertyUpdateInfo) => {
			const fragmentToUpdate = tempCollection.collection_fragments.find(
				(item: Avo.Collection.Fragment) => item.id === updateInfo.fragmentId
			);

			(fragmentToUpdate as any)[updateInfo.fieldName] = updateInfo.value;
		});

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
			const cleanedCollection = CollectionService.cleanCollectionBeforeSave(collectionWithNewName);

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

		const fragments = CollectionService.getFragments(currentCollection);

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

	async function onSaveCollection(refetchCollection: () => void) {
		setIsSavingCollection(true);
		if (currentCollection) {
			const newCollection = await CollectionService.updateCollection(
				initialCollection,
				currentCollection,
				triggerCollectionUpdate,
				triggerCollectionFragmentsInsert,
				triggerCollectionFragmentDelete,
				triggerCollectionFragmentUpdate,
				refetchCollection
			);
			if (newCollection) {
				setCurrentCollection(newCollection);
				setInitialCollection(cloneDeep(newCollection));
				toastService('Collectie opgeslagen', TOAST_TYPE.SUCCESS);
				trackEvents({
					event_object: {
						type: 'collection',
						identifier: String(newCollection.id),
					},
					event_message: `Gebruiker ${getProfileName()} heeft de collectie ${
						newCollection.id
					} bijgewerkt`,
					name: 'edit',
					category: 'item',
				});
			}
		}
		setIsSavingCollection(false);
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

		const tabs: Tab[] = COLLECTION_EDIT_TABS.map((tab: Tab) => ({
			...tab,
			active: currentTab === tab.id,
		}));

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
									<ButtonToolbar>
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
									</ButtonToolbar>
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
						updateFragmentProperties={updateFragmentProperties}
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
