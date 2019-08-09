import React, { Fragment, FunctionComponent, ReactText, useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router';

import { get, isEmpty } from 'lodash-es';
import { GET_COLLECTION_BY_ID } from '../collection.gql';

import {
	Avatar,
	Button,
	Container,
	Dropdown,
	DropdownButton,
	DropdownContent,
	Icon,
	MetaData,
	MetaDataItem,
	Modal,
	ModalBody,
	Spacer,
	Tabs,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import EditCollectionContent from './EditCollectionContent';
import EditCollectionMetadata from './EditCollectionMetadata';

interface EditCollectionProps extends RouteComponentProps {}

// TODO: Get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

const EditCollection: FunctionComponent<EditCollectionProps> = ({ match }) => {
	const [collectionId] = useState((match.params as any)['id'] as string);
	const [currentTab, setCurrentTab] = useState('inhoud');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
	const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState(false);
	const [currentCollection, setCurrentCollection] = useState();
	const [isFirstRender, setIsFirstRender] = useState(false);

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

	const onRenameCollection = () => {
		// TODO: Add cursor pointer to menu items under dropdown
		setIsOptionsMenuOpen(false);
		// TODO: Show toast
	};

	const onDeleteCollection = () => {
		setIsOptionsMenuOpen(false);
	};

	const onPreviewCollection = () => {
		// TODO: Open preview in new tab
	};

	const onSaveCollection = () => {
		// TODO: Update collection in database, currently in "currentCollection" state
	};

	// Update individual property of fragment
	const updateFragmentProperty = (value: string, fieldName: string, fragmentId: number) => {
		const temp = { ...currentCollection };

		const fragmentToUpdate: any = temp.fragments.find((item: any) => item.id === fragmentId);

		(fragmentToUpdate as any)[fieldName] = value;

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
		const fragments = currentCollection.fragments;

		const changeFragmentsPositions = (sign: number) => {
			const otherFragment = currentCollection.fragments.find(
				(fragment: any) => fragment.position === currentId - sign
			);
			fragments.find((fragment: any) => fragment.position === currentId).position -= sign;
			otherFragment.position += sign;
		};

		direction === 'up' ? changeFragmentsPositions(1) : changeFragmentsPositions(-1);

		setCurrentCollection({
			...currentCollection,
			fragments,
		});
	};

	const updateCollection = (collection: Avo.Collection.Response) =>
		setCurrentCollection(collection);

	const renderEditCollection = (collection: Avo.Collection.Response) => {
		if (!isFirstRender) {
			setCurrentCollection(collection);
			setIsFirstRender(true);
		}

		return currentCollection ? (
			<Fragment>
				<Container background="alt">
					<Container mode="vertical" size="small" background="alt">
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
										{currentCollection.owner_id && (
											<div className="o-flex o-flex--spaced">
												{!isEmpty(currentCollection.owner_id) && (
													<Avatar
														image={get(currentCollection, 'owner_id.avatar')}
														name={`${get(currentCollection, 'owner_id.fn')} ${get(
															currentCollection,
															'owner.sn'
														)} (${USER_GROUPS[get(currentCollection, 'owner_id.group_id')]})`}
														initials={
															get(currentCollection, 'owner_id.fn[0]', '') +
															get(currentCollection, 'owner_id.sn[0]', '')
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
											<Dropdown
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
													<Fragment>
														<a className="c-menu__item" onClick={onRenameCollection}>
															<div className="c-menu__label">Collectie hernoemen</div>
														</a>
														<a className="c-menu__item" onClick={onDeleteCollection}>
															<div className="c-menu__label">Verwijder</div>
														</a>
													</Fragment>
												</DropdownContent>
											</Dropdown>
											<Button type="primary" label="Opslaan" onClick={onSaveCollection} />
										</div>
									</ToolbarItem>
								</ToolbarRight>
							</Toolbar>
						</Container>
					</Container>
					<Container mode="horizontal" background="alt">
						<Tabs tabs={tabs} onClick={selectTab} />
					</Container>
				</Container>
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
				<Modal
					isOpen={isReorderModalOpen}
					title="Herschik items in collectie"
					size="large"
					onClose={() => setIsReorderModalOpen(!isReorderModalOpen)}
					scrollable={true}
				>
					<ModalBody>
						<p>DRAGGABLE LIST</p>
					</ModalBody>
				</Modal>
				<Modal
					isOpen={isShareModalOpen}
					title="Deel deze collectie"
					size="large"
					onClose={() => setIsShareModalOpen(!isShareModalOpen)}
					scrollable={true}
				>
					<ModalBody>
						<p>SHARE</p>
					</ModalBody>
				</Modal>
			</Fragment>
		) : null;
	};

	return (
		<DataQueryComponent
			query={GET_COLLECTION_BY_ID}
			variables={{ id: collectionId }}
			resultPath="migrate_collections[0]"
			renderData={renderEditCollection}
			notFoundMessage="Deze collectie werd niet gevonden"
		/>
	);
};

export default EditCollection;
