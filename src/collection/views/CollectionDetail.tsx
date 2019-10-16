import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	Column,
	Container,
	DropdownButton,
	DropdownContent,
	Flex,
	Grid,
	Icon,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MenuContent,
	MetaData,
	MetaDataItem,
	Navbar,
	Spacer,
	Thumbnail,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { connect } from 'react-redux';
import { PERMISSIONS, PermissionService } from '../../authentication/helpers/permission-service';
import { selectLogin } from '../../authentication/store/selectors';
import { LoginResponse } from '../../authentication/store/types';
import { RouteParts } from '../../constants';
import ControlledDropdown from '../../shared/components/ControlledDropdown/ControlledDropdown';
import { DataQueryComponent } from '../../shared/components/DataComponent/DataQueryComponent';
import DeleteObjectModal from '../../shared/components/modals/DeleteObjectModal';
import { renderAvatar } from '../../shared/helpers/formatters/avatar';
import { formatDate } from '../../shared/helpers/formatters/date';
import {
	generateAssignmentCreateLink,
	generateContentLinkString,
	generateSearchLinks,
} from '../../shared/helpers/generateLink';
import { ApolloCacheManager } from '../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { IconName } from '../../shared/types/types';
import FragmentDetail from '../components/FragmentDetail';
import { DELETE_COLLECTION, GET_COLLECTION_BY_ID } from '../graphql';
import { ContentTypeString } from '../types';

import { get } from 'lodash-es';
import './CollectionDetail.scss';

interface CollectionDetailProps extends RouteComponentProps {
	loginState: LoginResponse | null;
}

const CollectionDetail: FunctionComponent<CollectionDetailProps> = ({
	match,
	history,
	loginState,
}) => {
	const [collectionId] = useState((match.params as any)['id'] as string);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);

	const openDeleteModal = (collectionId: number) => {
		setIdToDelete(collectionId);
		setIsDeleteModalOpen(true);
	};

	const deleteCollection = async () => {
		try {
			await triggerCollectionDelete({
				variables: {
					id: idToDelete,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});
			setIdToDelete(null);
			toastService('Het verwijderen van de collectie is gelukt', TOAST_TYPE.SUCCESS);
		} catch (err) {
			console.error(err);
			toastService('Het verwijderen van de collectie is mislukt', TOAST_TYPE.DANGER);
		}
	};

	const renderCollection = (collection: Avo.Collection.Collection) => {
		const relatedItemStyle: any = { width: '100%', float: 'left', marginRight: '2%' };
		const canEditCollection = PermissionService.hasPermissions(
			[
				{ permissionName: PERMISSIONS.EDIT_OWN_COLLECTION, obj: collection },
				{ permissionName: PERMISSIONS.EDIT_ALL_COLLECTIONS },
			],
			get(loginState, 'userInfo.profile', null)
		);
		const canDeleteCollection = PermissionService.hasPermissions(
			[
				{ permissionName: PERMISSIONS.DELETE_OWN_COLLECTION, obj: collection },
				{ permissionName: PERMISSIONS.DELETE_ALL_COLLECTIONS },
			],
			get(loginState, 'userInfo.profile', null)
		);

		return (
			<>
				<Navbar autoHeight background="alt">
					<Container mode="vertical" size="small" background="alt">
						<Container mode="horizontal">
							<Toolbar autoHeight>
								<ToolbarLeft>
									<ToolbarItem>
										<Spacer margin={['top-small', 'bottom-small']}>
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
													label={String(12) /* TODO collection.bookmark_count */}
												/>
											</MetaData>
										</Spacer>
										<h1 className="c-h2 u-m-0">{collection.title}</h1>
										{collection.profile && (
											<Flex spaced="regular">
												{renderAvatar(collection.profile, { includeRole: true })}
											</Flex>
										)}
									</ToolbarItem>
								</ToolbarLeft>
								<ToolbarRight>
									<ToolbarItem>
										<div className="c-button-toolbar">
											<Button
												title="Bladwijzer"
												type="secondary"
												icon="bookmark"
												ariaLabel="Bladwijzer"
											/>
											<Button title="Deel" type="secondary" icon="share-2" ariaLabel="Deel" />
											<ControlledDropdown
												isOpen={isOptionsMenuOpen}
												onOpen={() => setIsOptionsMenuOpen(true)}
												onClose={() => setIsOptionsMenuOpen(false)}
												placement="bottom-end"
												autoSize
											>
												<DropdownButton>
													<Button
														type="secondary"
														icon="more-horizontal"
														ariaLabel="Meer opties"
														title="Meer opties"
													/>
												</DropdownButton>
												<DropdownContent>
													<MenuContent
														menuItems={[
															...(canEditCollection
																? [
																		{
																			icon: 'edit' as IconName,
																			id: 'edit',
																			label: 'Bewerk collectie',
																		},
																  ]
																: []),
															{
																icon: 'play' as IconName,
																id: 'play',
																label: 'Alle items afspelen',
															},
															{
																icon: 'clipboard' as IconName,
																id: 'createAssignment',
																label: 'Maak opdracht',
															},
															{ icon: 'copy' as IconName, id: 'duplicate', label: 'Dupliceer' },
															...(canDeleteCollection
																? [{ icon: 'delete' as IconName, id: 'delete', label: 'Verwijder' }]
																: []),
														]}
														onClick={itemId => {
															switch (itemId) {
																case 'edit':
																	history.push(
																		`${generateContentLinkString(
																			ContentTypeString.collection,
																			collection.id.toString()
																		)}/${RouteParts.Edit}`
																	);
																	break;

																case 'createAssignment':
																	history.push(
																		generateAssignmentCreateLink(
																			'KIJK',
																			String(collection.id),
																			'COLLECTIE'
																		)
																	);
																	break;

																case 'delete':
																	openDeleteModal(collection.id);
																	break;
																default:
																	return null;
															}
														}}
													/>
												</DropdownContent>
											</ControlledDropdown>
										</div>
									</ToolbarItem>
								</ToolbarRight>
							</Toolbar>
						</Container>
					</Container>
				</Navbar>
				<Container mode="vertical">
					<Container mode="horizontal">
						<FragmentDetail collectionFragments={collection.collection_fragments} />
					</Container>
				</Container>
				<Container mode="vertical">
					<Container mode="horizontal">
						<h3 className="c-h3">Info over deze collectie</h3>
						<Grid>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">Onderwijsniveau</p>
									<p className="c-body-1">
										{collection.lom_context && collection.lom_context.length ? (
											(collection.lom_context || []).map((lomContext: string) =>
												generateSearchLinks(String(collection.id), 'educationLevel', lomContext)
											)
										) : (
											<span className="u-d-block">-</span>
										)}
									</p>
								</Spacer>
							</Column>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">Laatst aangepast</p>
									<p className="c-body-1">{formatDate(collection.updated_at)}</p>
								</Spacer>
							</Column>
							<Column size="3-6">
								<p className="u-text-bold">Ordering</p>
								<p className="c-body-1">Deze collectie is een kopie van TODO add link</p>
								<p className="c-body-1">Deze collectie is deel van een map: TODO add link</p>
							</Column>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">Vakken</p>
									<p className="c-body-1">
										{collection.lom_classification && collection.lom_classification.length ? (
											(collection.lom_classification || []).map((lomClassification: string) =>
												generateSearchLinks(String(collection.id), 'domain', lomClassification)
											)
										) : (
											<span className="u-d-block">-</span>
										)}
									</p>
								</Spacer>
							</Column>
						</Grid>
						<hr className="c-hr" />
						<h3 className="c-h3" style={{ width: '100%' }}>
							Bekijk ook
						</h3>
						<Grid>
							<Column size="3-6">
								<Container size="small" mode="vertical">
									<ul className="c-media-card-list">
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/${RouteParts.Collection}/${collection.id}`}
												category="collection"
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category="collection"
														src={collection.thumbnail_path || undefined}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category="collection">
														{/*TODO resolve org id using graphql query*/}
														<MetaDataItem label={collection.organisation_id || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/${RouteParts.Collection}/${collection.id}`}
												category="collection"
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category="collection"
														src={collection.thumbnail_path || undefined}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category="collection">
														{/*TODO resolve org id using graphql query*/}
														<MetaDataItem label={collection.organisation_id || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
									</ul>
								</Container>
							</Column>
							<Column size="3-6">
								<Container size="small" mode="vertical">
									<ul className="c-media-card-list">
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/${RouteParts.Collection}/${collection.id}`}
												category="collection"
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category="collection"
														src={collection.thumbnail_path || undefined}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category="collection">
														{/*TODO resolve org id using graphql query*/}
														<MetaDataItem label={collection.organisation_id || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
										<li style={relatedItemStyle}>
											<MediaCard
												title="Organisatie van het politieke veld: Europa"
												href={`/${RouteParts.Collection}/${collection.id}`}
												category="collection"
												orientation="horizontal"
											>
												<MediaCardThumbnail>
													<Thumbnail
														category="collection"
														src={collection.thumbnail_path || undefined}
													/>
												</MediaCardThumbnail>
												<MediaCardMetaData>
													<MetaData category="collection">
														{/*TODO resolve org id using graphql query*/}
														<MetaDataItem label={collection.organisation_id || ''} />
													</MetaData>
												</MediaCardMetaData>
											</MediaCard>
										</li>
									</ul>
								</Container>
							</Column>
						</Grid>
					</Container>
				</Container>

				<DeleteObjectModal
					title={`Ben je zeker dat de collectie "${collection.title}" wil verwijderen?`}
					body="Deze actie kan niet ongedaan gemaakt worden"
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={deleteCollection}
				/>
			</>
		);
	};

	return (
		<DataQueryComponent
			query={GET_COLLECTION_BY_ID}
			variables={{ id: collectionId }}
			resultPath="app_collections[0]"
			renderData={renderCollection}
			notFoundMessage="Deze collectie werd niet gevonden"
		/>
	);
};

const mapStateToProps = (state: any) => ({
	loginState: selectLogin(state),
});

export default withRouter(connect(mapStateToProps)(CollectionDetail));
