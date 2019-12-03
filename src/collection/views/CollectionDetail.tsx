import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { RouteComponentProps, withRouter } from 'react-router';

import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	DropdownButton,
	DropdownContent,
	Grid,
	Header,
	HeaderAvatar,
	HeaderButtons,
	MediaCard,
	MediaCardMetaData,
	MediaCardThumbnail,
	MenuContent,
	MetaData,
	MetaDataItem,
	Spacer,
	Thumbnail,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { PermissionGuard } from '../../authentication/components';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { PERMISSIONS, PermissionService } from '../../authentication/helpers/permission-service';
import { selectLogin } from '../../authentication/store/selectors';
import { LoginResponse } from '../../authentication/store/types';
import { ControlledDropdown, DataQueryComponent, DeleteObjectModal } from '../../shared/components';
import { ROUTE_PARTS } from '../../shared/constants';
import {
	buildLink,
	createDropdownMenuItem,
	formatDate,
	generateAssignmentCreateLink,
	generateContentLinkString,
	generateSearchLinks,
	renderAvatar,
} from '../../shared/helpers';
import { ApolloCacheManager } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { getRelatedItems } from '../../shared/services/related-items-service';
import toastService from '../../shared/services/toast-service';
import { WORKSPACE_PATH } from '../../workspace/workspace.const';
import { COLLECTION_PATH } from '../collection.const';
import { DELETE_COLLECTION, GET_COLLECTION_BY_ID } from '../collection.gql';
import { ContentTypeString, DutchContentType, toEnglishContentType } from '../collection.types';
import { FragmentListDetail, ShareCollectionModal } from '../components';

import './CollectionDetail.scss';

const CONTENT_TYPE: DutchContentType = ContentTypeString.collection;

interface CollectionDetailProps extends RouteComponentProps {
	loginState: LoginResponse | null;
}

const CollectionDetail: FunctionComponent<CollectionDetailProps> = ({
	match,
	history,
	loginState,
}) => {
	// State
	const [collectionId] = useState((match.params as any)['id'] as string);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [isPublic, setIsPublic] = useState<boolean | null>(null);
	const [relatedCollections, setRelatedCollections] = useState<Avo.Search.ResultItem[] | null>(
		null
	);

	// Mutations
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);

	useEffect(() => {
		trackEvents({
			object: collectionId,
			object_type: 'collections',
			message: `Gebruiker ${getProfileName()} heeft de pagina voor collectie ${collectionId} bekeken`,
			action: 'view',
		});

		if (!relatedCollections) {
			getRelatedItems(collectionId, 'collections', 4)
				.then(relatedItems => setRelatedCollections(relatedItems))
				.catch(err => {
					console.error('Failed to get related items', err, {
						collectionId,
						index: 'collections',
						limit: 4,
					});
					toastService.danger('Het ophalen van de gerelateerde collecties is mislukt');
				});
		}
	}, [collectionId, relatedCollections]);

	const getPermission = (collection: Avo.Collection.Collection) => ({
		canDeleteCollection: PermissionService.hasPermissions([
			{ permissionName: PERMISSIONS.DELETE_OWN_COLLECTION, obj: collection },
			{ permissionName: PERMISSIONS.DELETE_ALL_COLLECTIONS },
		]),
		canEditCollection: {
			permissions: [
				{ permissionName: PERMISSIONS.EDIT_OWN_COLLECTION, obj: collection },
				{ permissionName: PERMISSIONS.EDIT_ALL_COLLECTIONS },
			],
			profile: get(loginState, 'userInfo.profile', null),
		},
	});

	// Listeners
	const onEditCollection = () => {
		history.push(
			`${generateContentLinkString(ContentTypeString.collection, `${collectionId}`)}/${
				ROUTE_PARTS.edit
			}`
		);
	};

	const onDeleteCollection = async () => {
		try {
			await triggerCollectionDelete({
				variables: {
					id: collectionId,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});
			history.push(WORKSPACE_PATH.WORKSPACE);
			toastService.success('De collectie werd succesvol verwijderd.');
		} catch (err) {
			console.error(err);
			toastService.danger('Het verwijderen van de collectie is mislukt.');
		}
	};

	const onClickDropdownItem = (item: ReactText) => {
		switch (item) {
			case 'createAssignment':
				history.push(generateAssignmentCreateLink('KIJK', `${collectionId}`, 'COLLECTIE'));
				break;
			case 'delete':
				setIsDeleteModalOpen(true);
				break;
			default:
				return null;
		}
	};

	// Render functions
	const renderRelatedCollections = () => {
		if (!relatedCollections || !relatedCollections.length) {
			return <p className="c-body-1">De gerelateerde collecties konden niet worden opgehaald.</p>;
		}

		relatedCollections.map((relatedCollection: Avo.Search.ResultItem) => {
			const { id, dc_title, thumbnail_path = undefined, original_cp = '' } = relatedCollection;
			const category = toEnglishContentType(CONTENT_TYPE);

			return (
				<Grid className="c-media-card-list">
					<Column size="3-6">
						<MediaCard
							title={dc_title}
							href={buildLink(COLLECTION_PATH.COLLECTION_DETAIL, { id })}
							category={category}
							orientation="horizontal"
						>
							<MediaCardThumbnail>
								<Thumbnail category={category} src={thumbnail_path} />
							</MediaCardThumbnail>
							<MediaCardMetaData>
								<MetaData category={category}>
									<MetaDataItem label={original_cp} />
								</MetaData>
							</MediaCardMetaData>
						</MediaCard>
					</Column>
				</Grid>
			);
		});
	};

	const renderCollection = (collection: Avo.Collection.Collection) => {
		const {
			id,
			is_public,
			profile,
			collection_fragments,
			lom_context,
			updated_at,
			title,
			lom_classification,
		} = collection;
		const { canDeleteCollection, canEditCollection } = getPermission(collection);
		const COLLECTION_DROPDOWN_ITEMS = [
			// TODO: DISABLED_FEATURE - createDropdownMenuItem("play", 'Alle items afspelen')
			createDropdownMenuItem('createAssignment', 'Maak opdracht', 'clipboard'),
			createDropdownMenuItem('duplicate', 'Dupliceer', 'copy'),
			...(canDeleteCollection && [createDropdownMenuItem('delete', 'Verwijder')]),
		];

		if (!isFirstRender) {
			setIsPublic(is_public);
			setIsFirstRender(true);
		}

		// Render functions
		const renderHeaderButtons = () => (
			<ButtonToolbar>
				<PermissionGuard {...canEditCollection}>
					<Button
						type="secondary"
						label="Delen"
						onClick={() => setIsShareModalOpen(!isShareModalOpen)}
					/>
				</PermissionGuard>
				<Button title="Bladwijzer" type="secondary" icon="bookmark" ariaLabel="Bladwijzer" />
				<Button title="Deel" type="secondary" icon="share-2" ariaLabel="Deel" />
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
						<MenuContent menuItems={COLLECTION_DROPDOWN_ITEMS} onClick={onClickDropdownItem} />
					</DropdownContent>
				</ControlledDropdown>
				<PermissionGuard {...canEditCollection}>
					<Spacer margin="left-small">
						<Button type="primary" icon="edit" label="Bewerken" onClick={onEditCollection} />
					</Spacer>
				</PermissionGuard>
			</ButtonToolbar>
		);

		return (
			<>
				<Header
					title={title}
					onClickTitle={() => null}
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
				<Container mode="vertical">
					<Container mode="horizontal">
						<FragmentListDetail
							collectionFragments={collection_fragments}
							showDescriptionNextToVideo
						/>
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
										{lom_context && lom_context.length ? (
											generateSearchLinks(`${id}`, 'educationLevel', lom_context)
										) : (
											<span className="u-d-block">-</span>
										)}
									</p>
								</Spacer>
							</Column>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">Laatst aangepast</p>
									<p className="c-body-1">{formatDate(updated_at)}</p>
								</Spacer>
							</Column>
							<Column size="3-6">
								<p className="u-text-bold">Ordering</p>
								{/* TODO: add links */}
								<p className="c-body-1">Deze collectie is een kopie van:</p>
								<p className="c-body-1">Deze collectie is deel van een map:</p>
							</Column>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">Vakken</p>
									<p className="c-body-1">
										{lom_classification && lom_classification.length ? (
											generateSearchLinks(`${id}`, 'subject', lom_classification)
										) : (
											<span className="u-d-block">-</span>
										)}
									</p>
								</Spacer>
							</Column>
						</Grid>
						<hr className="c-hr" />
						<h3 className="c-h3">Bekijk ook</h3>
						{renderRelatedCollections()}
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
					title={`Ben je zeker dat de collectie "${title}" wil verwijderen?`}
					body="Deze actie kan niet ongedaan gemaakt worden"
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={() => onDeleteCollection()}
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
