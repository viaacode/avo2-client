import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, eq, get, isEmpty, without } from 'lodash-es';
import React, { Fragment, FunctionComponent, ReactText, useEffect, useState } from 'react';
import { withApollo } from 'react-apollo';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Avatar,
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

import { MAX_SEARCH_DESCRIPTION_LENGTH } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';

import {
	DeleteCollectionModal,
	RenameCollectionModal,
	ReorderCollectionModal,
	ShareCollectionModal,
} from '../components';
import { USER_GROUPS } from '../constants';
import {
	DELETE_COLLECTION,
	DELETE_COLLECTION_FRAGMENT,
	GET_COLLECTION_BY_ID,
	INSERT_COLLECTION_FRAGMENT,
	UPDATE_COLLECTION,
	UPDATE_COLLECTION_FRAGMENT,
} from '../graphql';
import EditCollectionContent from './EditCollectionContent';
import EditCollectionMetadata from './EditCollectionMetadata';

interface EditCollectionProps extends RouteComponentProps {}

const EditCollection: FunctionComponent<EditCollectionProps> = props => {
	const [triggerCollectionUpdate] = useMutation(UPDATE_COLLECTION);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionFragmentDelete] = useMutation(DELETE_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentInsert] = useMutation(INSERT_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentUpdate] = useMutation(UPDATE_COLLECTION_FRAGMENT);
	const [collectionId] = useState<string | undefined>((props.match.params as any)['id']);
	const [currentTab, setCurrentTab] = useState('inhoud');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [currentCollection, setCurrentCollection] = useState<Avo.Collection.Response>();
	const [initialCollection, setInitialCollection] = useState<Avo.Collection.Response>();
	const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
	const [isSavingCollection, setIsSavingCollection] = useState<boolean>(false);

	// Tab navigation
	const tabs = [
		{
			id: 'inhoud',
			label: 'Inhoud',
			active: currentTab === 'inhoud',
			icon: 'collection',
		},
		{
			id: 'metadata',
			label: 'Metadata',
			active: currentTab === 'metadata',
			icon: 'file-text',
		},
	];

	const onUnload = (event: any) => {
		event.preventDefault();
		event.returnValue = '';
	};

	// Destroy event listener on unmount
	useEffect(() => window.removeEventListener('beforeunload', onUnload));

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

	const updateCollection = (collection: Avo.Collection.Response) => {
		setCurrentCollection(collection);
	};

	const deleteCollection = (collectionId: number) => {
		triggerCollectionDelete({
			variables: {
				id: collectionId,
			},
		});

		// TODO: Refresh data on Collections page.
		props.history.push(`/mijn-werkruimte/collecties`);
	};

	// Update individual property of fragment
	const updateFragmentProperty = (value: any, propertyName: string, fragmentId: number) => {
		const temp: Avo.Collection.Response = { ...currentCollection } as Avo.Collection.Response;

		window.addEventListener('beforeunload', onUnload);

		const fragmentToUpdate = temp.collection_fragments.find(
			(item: Avo.Collection.Fragment) => item.id === fragmentId
		);

		(fragmentToUpdate as any)[propertyName] = value;

		updateCollection(temp);
	};

	// Update individual property of collection
	const updateCollectionProperty = (value: any, fieldName: string) => {
		window.addEventListener('beforeunload', onUnload);

		setCurrentCollection({
			...currentCollection,
			[fieldName]: value,
		} as Avo.Collection.Response);
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
		const fragments = currentCollection.collection_fragments;

		const changeFragmentsPositions = (fragments: Avo.Collection.Fragment[], sign: number) => {
			const fragment = fragments.find(
				(fragment: Avo.Collection.Fragment) => fragment.position === currentId
			);
			const otherFragment = currentCollection.collection_fragments.find(
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

	function getValidationErrorForCollection(collection: Avo.Collection.Response): string {
		// List of validator functions, so we can use the functions separately as well
		return getValidationFeedbackForShortDescription(collection, true) || '';
	}

	const insertFragment = async (id: number, currentFragments: Avo.Collection.Fragment[]) => {
		if (!currentCollection) {
			toastService('De collectie was niet ingesteld', TOAST_TYPE.DANGER);
			return;
		}
		const tempFragment = currentFragments.find(
			(fragment: Avo.Collection.Fragment) => fragment.id === id
		);
		if (!tempFragment) {
			toastService(`Fragment om toe te voegen is niet gevonden (id: ${id})`);
			return;
		}
		const fragmentToAdd: Avo.Collection.Fragment = { ...tempFragment };

		const tempId = fragmentToAdd.id;
		delete fragmentToAdd.id;
		delete (fragmentToAdd as any).__typename;
		// TODO remove type cast when next typings repo version is released (1.8.0)
		delete (fragmentToAdd as any).item_meta;

		const response = await triggerCollectionFragmentInsert({
			variables: {
				id: currentCollection.id,
				fragment: fragmentToAdd,
			},
		});

		const newFragment = get(response, 'data.insert_app_collection_fragments.returning[0]');

		return {
			newFragment,
			oldId: tempId,
		};
	};

	async function onSaveCollection() {
		try {
			if (!currentCollection) {
				toastService(`De huidige collectie is niet gevonden`, TOAST_TYPE.DANGER);
				return;
			}
			setIsSavingCollection(true);
			// Validate collection before save
			const validationError = getValidationErrorForCollection(currentCollection);
			if (validationError) {
				toastService(validationError, TOAST_TYPE.DANGER);
				setIsSavingCollection(false);
				return;
			}

			let newCollection: Avo.Collection.Response = {
				...currentCollection,
			} as Avo.Collection.Response;

			// Not using lodash default value parameter since the value an be null and
			// that doesn't default to the default value
			// only undefined defaults to the default value
			const initialFragmentIds: number[] = get(initialCollection, 'collection_fragment_ids') || [];
			const currentFragmentIds: number[] = get(currentCollection, 'collection_fragment_ids') || [];
			const currentFragments: Avo.Collection.Fragment[] = get(
				currentCollection,
				'collection_fragment',
				[]
			);
			const newFragmentIds: number[] = get(newCollection, 'collection_fragment_ids') || [];

			// Insert fragments that added to collection
			const insertFragmentIds = without(newFragmentIds, ...initialFragmentIds);

			// Delete fragments that were removed from collection
			const deleteFragmentIds = without(initialFragmentIds, ...newFragmentIds);

			// Update fragments that are neither inserted nor deleted
			const updateFragmentIds = currentFragmentIds.filter((fragmentId: number) =>
				initialFragmentIds.includes(fragmentId)
			);

			const promises: any = [];

			insertFragmentIds.forEach(id => {
				promises.push(insertFragment(id, currentFragments));
			});

			const newFragmentData = await Promise.all(promises);

			newFragmentData.forEach((data: any) => {
				newCollection = {
					...currentCollection,
					collection_fragment_ids: [
						...currentFragmentIds.filter((fragmentId: number) => fragmentId !== data.oldId),
						data.newFragment.id,
					],
					collection_fragments: [
						...currentCollection.collection_fragments.filter(
							(fragment: Avo.Collection.Fragment) => fragment.id !== data.oldId
						),
						data.newFragment,
					],
				};
			});

			deleteFragmentIds.forEach((id: number) => {
				triggerCollectionFragmentDelete({ variables: { id } });
			});

			updateFragmentIds.forEach((id: number) => {
				const fragment: any = {
					...newCollection.collection_fragments.find((fragment: Avo.Collection.Fragment) => {
						return Number(id) === fragment.id;
					}),
				};

				delete fragment.__typename;
				delete fragment.item_meta;

				triggerCollectionFragmentUpdate({
					variables: {
						id,
						fragment,
					},
				});
			});

			const readyToStore = { ...newCollection };

			await readyToStore.collection_fragments.forEach((fragment: any) => {
				delete fragment.__typename;
				delete fragment.item_meta;

				triggerCollectionFragmentUpdate({
					variables: {
						fragment,
						id: fragment.id,
					},
				});
			});

			// Trigger collection update
			const propertiesToDelete = [
				'collection_fragments',
				'label_redactie',
				'owner',
				'collection_permissions',
				'__typename',
				'type',
			];

			const otherTables: any = {};

			propertiesToDelete.forEach((property: any) => {
				otherTables[property] = (readyToStore as any)[property];
				delete (readyToStore as any)[property];
			});

			await triggerCollectionUpdate({
				variables: {
					id: currentCollection.id,
					collection: readyToStore,
				},
			});
			setCurrentCollection(newCollection);
			setInitialCollection(cloneDeep(newCollection));
			setIsSavingCollection(false);
			toastService('Collectie opgeslagen', TOAST_TYPE.SUCCESS);
		} catch (err) {
			console.error(err);
			toastService('Opslaan mislukt', TOAST_TYPE.DANGER);
		}
	}

	const renderEditCollection = (collection: Avo.Collection.Response) => {
		if (!isFirstRender) {
			setCurrentCollection(collection);
			setInitialCollection(cloneDeep(collection)); // Clone so we can keep track of changes deep within the collection
			setIsFirstRender(true);
		}

		return currentCollection ? (
			<Fragment>
				<Container background={'alt'} mode="vertical" size="small">
					<Container mode="horizontal">
						<Toolbar>
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
									<h1
										className="c-h2 u-m-b-0 u-clickable"
										onClick={() => setIsRenameModalOpen(true)}
									>
										{currentCollection.title}
									</h1>
									{currentCollection.owner && (
										<Flex spaced="regular">
											{!isEmpty(get(currentCollection, 'owner.id')) && (
												<Avatar
													image={get(currentCollection, 'owner.avatar')}
													name={`${get(currentCollection, 'owner.first_name')} ${get(
														currentCollection,
														'owner.last_name'
													)} (
														${USER_GROUPS[get(currentCollection, 'owner.role.id')]})`}
													initials={
														get(currentCollection, 'owner.first_name[0]', '') +
														get(currentCollection, 'owner.last_name[0]', '')
													}
												/>
											)}
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
											disabled={
												JSON.stringify(currentCollection) !== JSON.stringify(initialCollection)
											}
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
											onOpen={() => setIsOptionsMenuOpen(true)}
											onClose={() => setIsOptionsMenuOpen(false)}
											placement="bottom-end"
											autoSize
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
												onClick={onSaveCollection}
												disabled={isSavingCollection}
											/>
										</Spacer>
									</div>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				<Navbar background={'alt'} placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={selectTab} />
					</Container>
				</Navbar>
				{currentTab === 'inhoud' && (
					<EditCollectionContent
						collection={currentCollection}
						swapFragments={swapFragments}
						updateCollection={updateCollection}
						updateFragmentProperty={updateFragmentProperty}
					/>
				)}
				{currentTab === 'metadata' && (
					<EditCollectionMetadata
						collection={currentCollection}
						updateCollectionProperty={updateCollectionProperty}
					/>
				)}
				<ReorderCollectionModal isOpen={isReorderModalOpen} setIsOpen={setIsReorderModalOpen} />
				<ShareCollectionModal
					collection={collection}
					isOpen={isShareModalOpen}
					setIsOpen={setIsShareModalOpen}
					initialIsPublic={collection.is_public}
					updateCollectionProperty={updateCollectionProperty}
				/>
				<DeleteCollectionModal
					isOpen={isDeleteModalOpen}
					setIsOpen={setIsDeleteModalOpen}
					deleteCollection={() => deleteCollection(collection.id)}
				/>
				<RenameCollectionModal
					collectionId={collection.id}
					isOpen={isRenameModalOpen}
					setIsOpen={setIsRenameModalOpen}
					initialCollectionName={collection.title}
					updateCollectionProperty={updateCollectionProperty}
				/>
			</Fragment>
		) : null;
	};

	return (
		<DataQueryComponent
			query={GET_COLLECTION_BY_ID}
			variables={{ id: collectionId }}
			resultPath="app_collections[0]"
			renderData={renderEditCollection}
			notFoundMessage="Deze collectie werd niet gevonden"
		/>
	);
};

export function getValidationFeedbackForShortDescription(
	collection: Avo.Collection.Response,
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

export default withRouter(withApollo(EditCollection));
