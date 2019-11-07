import { useMutation } from '@apollo/react-hooks';
import React, { FunctionComponent, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	ButtonToolbar,
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
import { get, isNil, omit } from 'lodash-es';

import PermissionGuard from '../../authentication/components/PermissionGuard';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
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
import { trackEvents } from '../../shared/services/event-logging-service';
import { getRelatedItems } from '../../shared/services/related-items-service';
import toastService, { TOAST_TYPE } from '../../shared/services/toast-service';
import { IconName } from '../../shared/types/types';
import { ShareCollectionModal } from '../components';
import FragmentDetail from '../components/FragmentDetail';
import { DELETE_COLLECTION, GET_COLLECTION_BY_ID, UPDATE_COLLECTION } from '../graphql';
import { ContentTypeString } from '../types';

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
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [isPublic, setIsPublic] = useState<boolean | null>(null);

	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [relatedCollections, setRelatedCollections] = useState<Avo.Search.ResultItem[] | null>(
		null
	);

	useEffect(() => {
		trackEvents({
			event_object: {
				type: 'collection',
				identifier: String(collectionId),
			},
			event_message: `Gebruiker ${getProfileName()} heeft de pagina voor collectie ${collectionId} bekeken`,
			name: 'view',
			category: 'item',
		});
		if (isNull(relatedCollections)) {
			getRelatedItems(collectionId, 'collections', 4)
				.then(relatedCollections => {
					setRelatedCollections(relatedCollections);
				})
				.catch(err => {
					console.error('Failed to get related items', err, {
						collectionId,
						index: 'collections',
						limit: 4,
					});
					toastService('Het ophalen van de gerelateerde collecties is mislukt', TOAST_TYPE.DANGER);
				});
		}
	}, [collectionId, relatedCollections]);

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

	const renderRelatedCollections = () => {
		if (relatedCollections && relatedCollections.length) {
			return relatedCollections.map(relatedCollection => (
				<Column size="3-6">
					<MediaCard
						title={relatedCollection.dc_title}
						href={`/${RouteParts.Collection}/${relatedCollection.id}`}
						category="collection"
						orientation="horizontal"
					>
						<MediaCardThumbnail>
							<Thumbnail
								category="collection"
								src={relatedCollection.thumbnail_path || undefined}
							/>
						</MediaCardThumbnail>
						<MediaCardMetaData>
							<MetaData category="collection">
								{/*TODO resolve org id using graphql query*/}
								<MetaDataItem label={relatedCollection.original_cp || ''} />
							</MetaData>
						</MediaCardMetaData>
					</MediaCard>
				</Column>
			));
		}
		return null;
	};

	const renderCollection = (collection: Avo.Collection.Collection) => {
		if (!isFirstRender) {
			setIsPublic(collection.is_public);
			setIsFirstRender(true);
		}

		const relatedItemStyle: any = { width: '100%', float: 'left', marginRight: '2%' };

		const canDeleteCollection = PermissionService.hasPermissions(
			[
				{ permissionName: PERMISSIONS.DELETE_OWN_COLLECTION, obj: collection },
				{ permissionName: PERMISSIONS.DELETE_ALL_COLLECTIONS },
			],
			get(loginState, 'userInfo.profile', null)
		);

		const canEditPermissions = {
			permissions: [
				{ permissionName: PERMISSIONS.EDIT_OWN_COLLECTION, obj: collection },
				{ permissionName: PERMISSIONS.EDIT_ALL_COLLECTIONS },
			],
			profile: get(loginState, 'userInfo.profile', null),
		};

		const onEdit = () => {
			history.push(
				`${generateContentLinkString(ContentTypeString.collection, collection.id.toString())}/${
					RouteParts.Edit
				}`
			);
		};

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
										<ButtonToolbar>
											<Button
												title="Bladwijzer"
												type="secondary"
												icon="bookmark"
												ariaLabel="Bladwijzer"
											/>
											<Button title="Deel" type="secondary" icon="share-2" ariaLabel="Deel" />
											<PermissionGuard {...canEditPermissions}>
												<Button
													type="secondary"
													label="Delen"
													onClick={() => setIsShareModalOpen(!isShareModalOpen)}
												/>
											</PermissionGuard>
											<ControlledDropdown
												isOpen={isOptionsMenuOpen}
												menuWidth="fit-content"
												onOpen={() => setIsOptionsMenuOpen(true)}
												onClose={() => setIsOptionsMenuOpen(false)}
												placement="bottom-end"
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
											<PermissionGuard {...canEditPermissions}>
												<Spacer margin="left-small">
													<Button type="primary" icon="edit" label="Bewerken" onClick={onEdit} />
												</Spacer>
											</PermissionGuard>
										</ButtonToolbar>
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
												generateSearchLinks(String(collection.id), 'subject', lomClassification)
											)
										) : (
											<span className="u-d-block">-</span>
										)}
									</p>
								</Spacer>
							</Column>
						</Grid>
						<hr className="c-hr" />
						<h3 className="c-h3">Bekijk ook</h3>
						<Grid className="c-media-card-list">{renderRelatedCollections()}</Grid>
					</Container>
				</Container>
				{isPublic !== null && (
					<ShareCollectionModal
						collection={{ ...collection, is_public: isPublic }}
						isOpen={isShareModalOpen}
						onClose={() => setIsShareModalOpen(false)}
						setIsPublic={setIsPublic}
					/>
				)}
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
