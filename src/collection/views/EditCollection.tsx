import React, { Fragment, FunctionComponent, ReactText, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps } from 'react-router';

import { get, isEmpty } from 'lodash-es';
import { Dispatch } from 'redux';

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

import { getCollection } from '../store/actions';
import { selectCollection } from '../store/selectors';

import EditCollectionContent from './EditCollectionContent';
import EditCollectionMetadata from './EditCollectionMetadata';

// TODO: Remove when added to avo2-client
import 'react-trumbowyg/dist/trumbowyg.min.css';
// TODO: Remove when possible
import mockCollection from './mockCollections';
// TODO get these from the api once the database is filled up
export const USER_GROUPS: string[] = ['Docent', 'Leering', 'VIAA medewerker', 'Uitgever'];

interface EditCollectionProps extends RouteComponentProps {
	collection: Avo.Collection.Response;
	getCollection: (id: string) => Dispatch;
}

const EditCollection: FunctionComponent<EditCollectionProps> = ({
	collection,
	getCollection,
	match,
}) => {
	const [id] = useState((match.params as any)['id'] as string);
	const [currentTab, setCurrentTab] = useState('inhoud');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState(false);
	const [isReorderModalOpen, setIsReorderModalOpen] = useState(false);
	// TODO: Replace mockCollection by collection
	const [currentCollection, setCurrentCollection] = useState(mockCollection);

	// Get collection from API when id changes
	useEffect(() => {
		getCollection(id);
	}, [id, getCollection]);

	// Update collection in page state when redux state changes.
	// TODO: Replace mockCollection by collection
	useEffect(() => {
		setCurrentCollection(mockCollection);
	}, [mockCollection]);

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

	const onShareCollection = () => {};

	const onPreviewCollection = () => {};

	const onSaveCollection = () => {
		// TODO: Update collection in database,
	};

	const swapFragments = (fragments: any[], currentId: number, direction: 'up' | 'down') => {
		const changeFragmentsPositions = (sign: number) => {
			fragments.find(fragment => fragment.id === currentId).id -= sign;
			fragments.find(fragment => fragment.id === currentId - sign).id += sign;
		};

		direction === 'up' ? changeFragmentsPositions(1) : changeFragmentsPositions(-1);

		setCurrentCollection({
			...currentCollection,
			fragments,
		});
	};

	const onChangeFieldValue = (fragmentId: number, fieldName: string, fieldValue: string) => {
		const temp = currentCollection;

		const fieldToUpdate = currentCollection.fragments[fragmentId].fields.findIndex(
			field => field.name === fieldName
		);

		temp.fragments[fragmentId].fields[fieldToUpdate].value = fieldValue;

		setCurrentCollection(temp);
	};

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
									{currentCollection.owner && (
										<div className="o-flex o-flex--spaced">
											{!isEmpty(currentCollection.owner) && (
												<Avatar
													image={get(currentCollection, 'owner.avatar')}
													name={`${get(currentCollection, 'owner.fn')} ${get(
														currentCollection,
														'owner.sn'
													)} (${USER_GROUPS[get(currentCollection, 'owner.group_id')]})`}
													initials={
														get(currentCollection, 'owner.fn[0]', '') +
														get(currentCollection, 'owner.sn[0]', '')
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
										<Button type="secondary" label="Delen" onClick={onShareCollection} />
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
													<a
														className="c-menu__item"
														onClick={() => {
															// TODO add cursor pointer to menu items under dropdown
															setIsOptionsMenuOpen(false);
															// TODO show toast
														}}
													>
														<div className="c-menu__label">Collectie hernoemen</div>
													</a>
													<a
														className="c-menu__item"
														onClick={() => {
															setIsOptionsMenuOpen(false);
															// TODO show toast
														}}
													>
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
			{currentTab === 'inhoud' && (
				<EditCollectionContent
					collection={currentCollection}
					swapFragments={swapFragments}
					onChangeFieldValue={onChangeFieldValue}
				/>
			)}
			{currentTab === 'metadata' && <EditCollectionMetadata collection={currentCollection} />}
		</Fragment>
	) : null;
};

const mapStateToProps = (state: any, { match }: EditCollectionProps) => ({
	collection: selectCollection(state, (match.params as any).id),
});

const mapDispatchToProps = (dispatch: Dispatch) => {
	return {
		getCollection: (id: string) => dispatch(getCollection(id) as any),
	};
};

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(EditCollection);
