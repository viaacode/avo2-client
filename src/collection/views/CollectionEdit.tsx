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
	Header,
	HeaderAvatar,
	HeaderButtons,
	MenuContent,
	Navbar,
	Spacer,
	Tabs,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { RouteParts } from '../../constants';
import {
	ControlledDropdown,
	DataQueryComponent,
	DeleteObjectModal,
	InputModal,
} from '../../shared/components';
import { createDropdownMenuItem, renderAvatar } from '../../shared/helpers';
import { ApolloCacheManager } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';

import { CollectionEditContent, CollectionEditMetaData } from '.';
import { COLLECTION_EDIT_TABS } from '../collection.const';
import {
	DELETE_COLLECTION,
	DELETE_COLLECTION_FRAGMENT,
	GET_COLLECTION_BY_ID,
	INSERT_COLLECTION_FRAGMENTS,
	UPDATE_COLLECTION,
	UPDATE_COLLECTION_FRAGMENT,
} from '../collection.gql';
import { CollectionService } from '../collection.service';
import { FragmentPropertyUpdateInfo, Tab } from '../collection.types';
import {
	// TODO: DISABLED FEATURE - ReorderCollectionModal,
	ShareCollectionModal,
} from '../components';

interface CollectionEditProps extends RouteComponentProps {}

let currentCollection: Avo.Collection.Collection | undefined;
let setCurrentCollection: (collection: Avo.Collection.Collection) => void;

const CollectionEdit: FunctionComponent<CollectionEditProps> = props => {
	// State
	const [collectionId] = useState<string | undefined>((props.match.params as any)['id']);
	const [currentTab, setCurrentTab] = useState<string>('inhoud');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isSavingCollection, setIsSavingCollection] = useState<boolean>(false);
	[currentCollection, setCurrentCollection] = useState<Avo.Collection.Collection | undefined>(
		undefined
	);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [initialCollection, setInitialCollection] = useState<Avo.Collection.Collection>();
	const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
	// TODO: DISABLED FEATURE - const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);

	// Mutations
	const [triggerCollectionUpdate] = useMutation(UPDATE_COLLECTION);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionFragmentDelete] = useMutation(DELETE_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);
	const [triggerCollectionFragmentUpdate] = useMutation(UPDATE_COLLECTION_FRAGMENT);

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

	// Add active state to current tab
	const tabs: Tab[] = COLLECTION_EDIT_TABS.map((tab: Tab) => ({
		...tab,
		active: currentTab === tab.id,
	}));

	// Update individual property of collection
	const updateCollectionProperty = (value: any, fieldName: string) => {
		setCurrentCollection({
			...currentCollection,
			[fieldName]: value,
		} as Avo.Collection.Collection);
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

	const hasUnsavedChanged = () =>
		JSON.stringify(currentCollection) !== JSON.stringify(initialCollection);

	// Listeners
	const onSaveCollection = async (refetchCollection: () => void) => {
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
						identifier: `${newCollection.id}`,
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
	};

	const onClickRename = () => {
		setIsOptionsMenuOpen(false);
		setIsRenameModalOpen(true);
	};

	const onRenameCollection = async (newTitle: string) => {
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
			});
		} catch (err) {
			console.error(err);
			toastService('Het hernoemen van de collectie is mislukt');
		}
	};

	const onClickDelete = () => {
		setIsOptionsMenuOpen(false);
		setIsDeleteModalOpen(true);
	};

	const onDeleteCollection = async () => {
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

			props.history.push(`/${RouteParts.Workspace}/${RouteParts.Collections}`);
		} catch (err) {
			console.error(err);
			toastService('Het verwijderen van de collectie is mislukt');
		}
	};

	// TODO: DISABLED FEATURE
	// const onPreviewCollection = () => {};

	const onClickDropdownItem = (item: ReactText) => {
		switch (item) {
			case 'rename':
				onClickRename();
				break;
			case 'delete':
				onClickDelete();
				break;
			default:
				return null;
		}
	};

	const onCloseShareCollectionModal = (collection?: Avo.Collection.Collection) => {
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

	const onUnload = (event: any) => {
		if (hasUnsavedChanged()) {
			event.preventDefault();

			// Chrome requires returnValue to be set
			event.returnValue = '';
		}
	};

	// Render functions
	const renderCollectionEdit = (
		collection: Avo.Collection.Collection,
		refetchCollection: () => void
	) => {
		if (!currentCollection) {
			setCurrentCollection(collection);
			setInitialCollection(cloneDeep(collection));
			return null;
		}

		const { profile } = collection;
		const { title } = currentCollection;
		const COLLECTION_DROPDOWN_ITEMS = [
			createDropdownMenuItem('rename', 'Collectie hernoemen', 'folder'),
			createDropdownMenuItem('delete', 'Verwijderen'),
		];

		const renderSaveButton = () => (
			<Button
				type="primary"
				label="Opslaan"
				onClick={() => onSaveCollection(refetchCollection)}
				disabled={isSavingCollection}
			/>
		);

		const renderHeaderButtons = () => (
			<ButtonToolbar>
				<Button
					type="secondary"
					label="Delen"
					disabled={hasUnsavedChanged()}
					title={
						!eq(currentCollection, initialCollection) ? 'U moet uw wijzigingen eerst opslaan' : ''
					}
					onClick={() => setIsShareModalOpen(!isShareModalOpen)}
				/>
				{/* TODO: DISABLED FEATURE
					<Button type="secondary" label="Bekijk" onClick={onPreviewCollection} disabled />
				*/}
				{/* TODO: DISABLED FEATURE
					<Button
						type = "secondary"
						label="Herschik alle items"
						onClick={() => setIsReorderModalOpen(!isReorderModalOpen)}
						disabled
					/>
				*/}
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
						<MenuContent menuItems={COLLECTION_DROPDOWN_ITEMS} onClick={onClickDropdownItem} />
					</DropdownContent>
				</ControlledDropdown>
				<Spacer margin="left-small">{renderSaveButton()}</Spacer>
			</ButtonToolbar>
		);

		const renderTab = () => {
			if (currentCollection) {
				switch (currentTab) {
					case 'inhoud':
						return (
							<CollectionEditContent
								collection={currentCollection}
								swapFragments={swapFragments}
								updateCollection={setCurrentCollection}
								updateFragmentProperties={updateFragmentProperties}
							/>
						);
					case 'metadata':
						return (
							<CollectionEditMetaData
								collection={currentCollection}
								updateCollectionProperty={updateCollectionProperty}
							/>
						);
					default:
						return null;
				}
			}
		};

		return (
			<>
				<Prompt
					when={hasUnsavedChanged()}
					message="Er zijn nog niet opgeslagen wijzigingen, weet u zeker dat u de pagina wil verlaten?"
				/>
				<Header
					title={title}
					onClickTitle={() => setIsRenameModalOpen(true)}
					category="collection"
					categoryLabel="collectie"
					showMetaData
					bookmarks="0" // TODO: Real bookmark count
					views="0" // TODO: Real view count
				>
					<HeaderButtons>{renderHeaderButtons()}</HeaderButtons>
					<HeaderAvatar>
						<>{profile && renderAvatar(profile, { includeRole: true })}</>
					</HeaderAvatar>
				</Header>
				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={selectTab} />
					</Container>
				</Navbar>
				{renderTab()}
				<Container background="alt" mode="vertical">
					<Container mode="horizontal">
						<Toolbar autoHeight>
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>{renderSaveButton()}</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				{/* TODO: DISABLED_FEATURE
					<ReorderCollectionModal
						isOpen={isReorderModalOpen}
						onClose={() => setIsReorderModalOpen(false)}
					/>
				*/}
				<ShareCollectionModal
					collection={currentCollection}
					isOpen={isShareModalOpen}
					onClose={onCloseShareCollectionModal}
					setIsPublic={(value: boolean) => updateCollectionProperty(value, 'is_public')}
				/>
				<DeleteObjectModal
					title={`Ben je zeker dat de collectie "${title}" wil verwijderen?`}
					body="Deze actie kan niet ongedaan gemaakt worden"
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={onDeleteCollection}
				/>
				<InputModal
					title="Hernoem deze collectie"
					inputLabel="Naam collectie:"
					inputValue={title}
					isOpen={isRenameModalOpen}
					onClose={() => setIsRenameModalOpen(false)}
					inputCallback={onRenameCollection}
				/>
			</>
		);
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

export default withRouter(withApollo(CollectionEdit));
