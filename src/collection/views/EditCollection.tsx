import { useMutation } from '@apollo/react-hooks';
import React, { Fragment, FunctionComponent, ReactText, useState } from 'react';
import { withApollo } from 'react-apollo';
import { RouteComponentProps, withRouter } from 'react-router';

import { get, isEmpty, without } from 'lodash-es';
import {
	// DELETE_COLLECTION,
	DELETE_COLLECTION_FRAGMENT,
	GET_COLLECTION_BY_ID,
	INSERT_COLLECTION_FRAGMENT,
	UPDATE_COLLECTION,
	UPDATE_COLLECTION_FRAGMENT,
} from '../collection.gql';

import {
	Avatar,
	Button,
	Container,
	DropdownButton,
	DropdownContent,
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

import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import DeleteCollectionModal from '../components/DeleteCollectionModal';
import RenameCollectionModal from '../components/RenameCollectionModal';
import ReorderCollectionModal from '../components/ReorderCollectionModal';
import ShareCollectionModal from '../components/ShareCollectionModal';
import EditCollectionContent from './EditCollectionContent';
import EditCollectionMetadata from './EditCollectionMetadata';

interface EditCollectionProps extends RouteComponentProps {}

// TODO: Get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

const EditCollection: FunctionComponent<EditCollectionProps> = props => {
	const [triggerCollectionUpdate] = useMutation(UPDATE_COLLECTION);
	// const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionFragmentDelete] = useMutation(DELETE_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentInsert] = useMutation(INSERT_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentUpdate] = useMutation(UPDATE_COLLECTION_FRAGMENT);
	const [collectionId] = useState((props.match.params as any)['id'] as string);
	const [currentTab, setCurrentTab] = useState('inhoud');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
	const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
	const [isFirstRender, setIsFirstRender] = useState(false);
	const [currentCollection, setCurrentCollection] = useState();
	const [initialCollection, setInitialCollection] = useState();
	const [isRenameModalOpen, setIsRenameModalOpen] = useState(false);

	// Tab navigation
	const tabs = [
		{
			id: 'inhoud',
			label: 'Inhoud',
			active: currentTab === 'inhoud',
		},
		{
			id: 'metadata',
			label: 'Metadata',
			active: currentTab === 'metadata',
		},
	];

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
		// TODO: Cascade deletion adaption
		// triggerCollectionDelete({
		// 	variables: {
		// 		id: collectionId,
		// 	},
		// });
		props.history.push(`/mijn-werkruimte/collecties`);
	};

	// Update individual property of fragment
	const updateFragmentProperty = (value: string, propertyName: string, fragmentId: number) => {
		const temp: Avo.Collection.Response = { ...currentCollection };

		const fragmentToUpdate = temp.collection_fragments.find(
			(item: Avo.Collection.Fragment) => item.id === fragmentId
		);

		(fragmentToUpdate as any)[propertyName] = value;

		updateCollection(temp);
	};

	// Update individual property of collection
	const updateCollectionProperty = (value: string, fieldName: string) =>
		setCurrentCollection({
			...currentCollection,
			[fieldName]: value,
		});

	// Swap position of two fragments within a collection
	const swapFragments = (currentId: number, direction: 'up' | 'down') => {
		const fragments = currentCollection.collection_fragments;

		const changeFragmentsPositions = (sign: number) => {
			const otherFragment = currentCollection.collection_fragments.find(
				(fragment: Avo.Collection.Fragment) => fragment.position === currentId - sign
			);
			fragments.find(
				(fragment: Avo.Collection.Fragment) => fragment.position === currentId
			).position -= sign;
			otherFragment.position += sign;
		};

		direction === 'up' ? changeFragmentsPositions(1) : changeFragmentsPositions(-1);

		setCurrentCollection({
			...currentCollection,
			collection_fragments: fragments,
		});
	};

	const renderEditCollection = (collection: Avo.Collection.Response) => {
		async function onSaveCollection() {
			let newCollection: Avo.Collection.Response = { ...currentCollection };

			// Insert fragments that added to collection
			const insertFragmentIds = without(
				newCollection.collection_fragment_ids || [],
				...(initialCollection.collection_fragment_ids || [])
			);

			console.log('INSERT', insertFragmentIds);

			// Delete fragments that were removed from collection
			const deleteFragmentIds = without(
				initialCollection.collection_fragment_ids || [],
				...(newCollection.collection_fragment_ids || [])
			);

			console.log('DELETE', deleteFragmentIds);

			// Update fragments that are neither inserted nor deleted
			const updateFragmentIds = (currentCollection.collection_fragment_ids || []).filter(
				(fragmentId: number) =>
					(initialCollection.collection_fragment_ids || []).includes(fragmentId)
			);

			console.log('UPDATE', updateFragmentIds);

			const insertFragment = async (id: number) => {
				const fragmentToAdd = {
					...currentCollection.collection_fragments.find(
						(fragment: Avo.Collection.Fragment) => fragment.id === id
					),
				};

				const tempId = fragmentToAdd.id;
				delete fragmentToAdd.id;
				delete fragmentToAdd.__typename;

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

			const promises: any = [];

			insertFragmentIds.forEach(id => {
				promises.push(insertFragment(id));
			});

			const newFragmentData = await Promise.all(promises);

			newFragmentData.forEach((data: any) => {
				newCollection = {
					...currentCollection,
					collection_fragment_ids: [
						...currentCollection.collection_fragment_ids.filter(
							(fragmentId: number) => fragmentId !== data.oldId
						),
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

			setCurrentCollection(newCollection);
			setInitialCollection({
				...collection,
				collection_fragment_ids: newCollection.collection_fragment_ids,
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

				triggerCollectionFragmentUpdate({
					variables: {
						id,
						fragment,
					},
				});
			});

			const readyToStore = { ...newCollection };

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

			triggerCollectionUpdate({
				variables: {
					id: currentCollection.id,
					collection: {
						...readyToStore,
						// collection_fragment_ids: [],
					},
				},
			});
		}

		if (!isFirstRender) {
			setCurrentCollection(collection);
			setInitialCollection(collection);
			setIsFirstRender(true);
		}

		return currentCollection ? (
			<Fragment>
				<Container background="alt" mode="vertical" size="small">
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
									<h1 className="c-h2 u-m-b-0">{currentCollection.title}</h1>
									{currentCollection.owner && (
										<div className="o-flex o-flex--spaced">
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
										</div>
									)}
								</ToolbarItem>
							</ToolbarLeft>
							<ToolbarRight>
								<ToolbarItem>
									<div className="c-button-toolbar">
										<Button
											type="secondary"
											label="Delen"
											onClick={() => setIsShareModalOpen(!isShareModalOpen)}
										/>
										<Button type="secondary" label="Bekijk" onClick={onPreviewCollection} />
										<Button
											type="secondary"
											label="Herschik alle items"
											onClick={() => setIsReorderModalOpen(!isReorderModalOpen)}
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
											<Button type="primary" label="Opslaan" onClick={onSaveCollection} />
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
				<ShareCollectionModal isOpen={isShareModalOpen} setIsOpen={setIsShareModalOpen} />
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

export default withRouter(withApollo(EditCollection));
