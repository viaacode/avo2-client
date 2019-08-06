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

	// Get collection from API when id changes
	useEffect(() => {
		getCollection(id);
	}, [id, getCollection]);

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

	const onReorderCollection = () => {};

	const onSaveCollection = () => {};

	return collection ? (
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
												label={String(188) /* TODO collection.view_count */}
											/>
											<MetaDataItem
												icon="bookmark"
												label={String(12) /* TODO collection.bookInhoud_count */}
											/>
										</MetaData>
									</Spacer>
									<h1 className="c-h2 u-m-b-0">{collection.title}</h1>
									{collection.owner && (
										<div className="o-flex o-flex--spaced">
											{!isEmpty(collection.owner) && (
												<Avatar
													image={collection.owner.avatar || undefined}
													name={`${collection.owner.fn} ${collection.owner.sn} (${
														USER_GROUPS[collection.owner.group_id]
													})`}
													initials={
														get(collection, 'owner.fn[0]', '') + get(collection, 'owner.sn[0]', '')
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
											onClick={onReorderCollection}
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
			{currentTab === 'inhoud' && <EditCollectionContent collection={mockCollection} />}
			{currentTab === 'metadata' && <EditCollectionMetadata collection={collection} />}
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
