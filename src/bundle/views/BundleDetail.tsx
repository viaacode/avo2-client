import { useMutation } from '@apollo/react-hooks';
import { get, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Column,
	Container,
	DropdownButton,
	DropdownContent,
	DutchContentType,
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

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import {
	PermissionNames,
	PermissionService,
} from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { DELETE_COLLECTION, GET_COLLECTION_BY_ID } from '../../collection/collection.gql';
import { ContentTypeString, toEnglishContentType } from '../../collection/collection.types';
import {
	ControlledDropdown,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
} from '../../shared/components';
import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { ROUTE_PARTS } from '../../shared/constants';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	formatDate,
	generateAssignmentCreateLink,
	generateContentLinkString,
	generateSearchLinks,
	renderAvatar,
} from '../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import { getRelatedItems } from '../../shared/services/related-items-service';
import toastService from '../../shared/services/toast-service';
import { WORKSPACE_PATH } from '../../workspace/workspace.const';

import { BUNDLE_PATH } from '../bundle.const';
import CollectionList from '../components/CollectionList';
import './CollectionDetail.scss';

const CONTENT_TYPE: DutchContentType = ContentTypeString.collection;

interface CollectionDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const BundleDetail: FunctionComponent<CollectionDetailProps> = ({
	history,
	location,
	match,
	user,
}) => {
	const [t] = useTranslation();

	// State
	const [bundleId] = useState(match.params.id);
	const [bundle, setBundle] = useState<Avo.Collection.Collection | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isAddToBundleModalOpen, setIsAddToBundleModalOpen] = useState<boolean>(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [isPublic, setIsPublic] = useState<boolean | null>(null);
	const [relatedBundles, setRelatedCollections] = useState<Avo.Search.ResultItem[] | null>(null);
	const [permissions, setPermissions] = useState<
		Partial<{
			canViewCollections: boolean;
			canEditCollections: boolean;
			canDeleteCollections: boolean;
			canCreateCollections: boolean;
			canViewItems: boolean;
		}>
	>({});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	// Mutations
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);

	const checkPermissions = async () => {
		try {
			const rawPermissions = await Promise.all([
				PermissionService.hasPermissions(
					[
						{ name: PermissionNames.VIEW_COLLECTIONS },
						{ name: PermissionNames.VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT, obj: bundleId },
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{ name: PermissionNames.EDIT_OWN_COLLECTIONS, obj: bundleId },
						{ name: PermissionNames.EDIT_ANY_COLLECTIONS },
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{ name: PermissionNames.DELETE_OWN_COLLECTIONS, obj: bundleId },
						{ name: PermissionNames.DELETE_ANY_COLLECTIONS },
					],
					user
				),
				PermissionService.hasPermissions([{ name: PermissionNames.CREATE_COLLECTIONS }], user),
				PermissionService.hasPermissions([{ name: PermissionNames.VIEW_ITEMS }], user),
			]);
			const permissionObj = {
				canViewCollections: rawPermissions[0],
				canEditCollections: rawPermissions[1],
				canDeleteCollections: rawPermissions[2],
				canCreateCollections: rawPermissions[3],
				canViewItems: rawPermissions[4],
			};
			const response = await dataService.query({
				query: GET_COLLECTION_BY_ID,
				variables: { id: bundleId },
			});

			if (response.errors) {
				console.error(
					new CustomError('Failed to  get collection from database', null, {
						collectionId: bundleId,
						errors: response.errors,
					})
				);
				setLoadingInfo({
					state: 'error',
					message: 'Het ophalen van de collectie is mislukt',
					icon: 'alert-triangle',
				});
			}

			const collectionObj = get(response, 'data.app_collections[0]');

			if (!collectionObj) {
				console.error('query for collection returned empty result', null, {
					collectionId: bundleId,
					response,
				});
				setLoadingInfo({
					state: 'error',
					message: t('Deze collectie werdt niet gevonden'),
					icon: 'search',
				});
			} else {
				// Collection loaded successfully
				setPermissions(permissionObj);
				setBundle(collectionObj);
			}
		} catch (err) {
			console.error('Failed to check permissions or get collection from the database', err, {
				collectionId: bundleId,
			});
			setLoadingInfo({
				state: 'error',
				message: t('Er ging iets mis tijdens het ophalen van de collectie'),
				icon: 'alert-triangle',
			});
		}
	};

	useEffect(() => {
		trackEvents(
			{
				object: bundleId,
				object_type: 'collections',
				message: `Gebruiker ${getProfileName(
					user
				)} heeft de pagina voor collectie ${bundleId} bekeken`,
				action: 'view',
			},
			user
		);

		if (!relatedBundles) {
			getRelatedItems(bundleId, 'collections', 4)
				.then(relatedItems => setRelatedCollections(relatedItems))
				.catch(err => {
					console.error('Failed to get related items', err, {
						collectionId: bundleId,
						index: 'collections',
						limit: 4,
					});
					toastService.danger(t('Het ophalen van de gerelateerde collecties is mislukt'));
				});
		}

		checkPermissions();
	}, [bundleId, relatedBundles, t, user, checkPermissions]);

	useEffect(() => {
		if (!isEmpty(permissions) && bundle) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [permissions, bundle, setLoadingInfo]);

	// Listeners
	const onEditCollection = () => {
		history.push(
			`${generateContentLinkString(ContentTypeString.collection, `${bundleId}`)}/${
				ROUTE_PARTS.edit
			}`
		);
	};

	const onDeleteBundle = async () => {
		try {
			await triggerCollectionDelete({
				variables: {
					id: bundleId,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});
			history.push(WORKSPACE_PATH.WORKSPACE);
			toastService.success(t('De bundel werd succesvol verwijderd.'));
		} catch (err) {
			console.error(err);
			toastService.danger(t('Het verwijderen van de bundel is mislukt.'));
		}
	};

	const onClickDropdownItem = (item: ReactText) => {
		switch (item) {
			case 'createAssignment':
				redirectToClientPage(
					generateAssignmentCreateLink('KIJK', `${bundleId}`, 'COLLECTIE'),
					history
				);
				break;
			case 'addToBundle':
				setIsAddToBundleModalOpen(true);
				break;
			case 'delete':
				setIsDeleteModalOpen(true);
				break;
			default:
				return null;
		}
	};

	// Render functions
	const renderRelatedBundles = () => {
		if (!relatedBundles || !relatedBundles.length) {
			return (
				<p className="c-body-1">
					<Trans>De gerelateerde bundels konden niet worden opgehaald.</Trans>
				</p>
			);
		}

		relatedBundles.map((relatedBundle: Avo.Search.ResultItem) => {
			const { id, dc_title, thumbnail_path = undefined, original_cp = '' } = relatedBundle;
			const category = toEnglishContentType(CONTENT_TYPE);

			return (
				<Grid className="c-media-card-list">
					<Column size="3-6">
						<MediaCard
							category={category}
							onClick={() =>
								redirectToClientPage(buildLink(BUNDLE_PATH.BUNDLES_DETAIL, { id }), history)
							}
							orientation="horizontal"
							title={dc_title}
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

	const renderHeaderButtons = () => {
		const BUNDLE_DROPDOWN_ITEMS = [
			...(permissions.canCreateCollections
				? [createDropdownMenuItem('duplicate', 'Dupliceer', 'copy')]
				: []),
			...(permissions.canDeleteCollections ? [createDropdownMenuItem('delete', 'Verwijder')] : []),
		];
		return (
			<ButtonToolbar>
				{permissions.canEditCollections && (
					<Button
						type="secondary"
						label={t('collection/views/collection-detail___delen')}
						onClick={() => setIsShareModalOpen(!isShareModalOpen)}
					/>
				)}
				<Button
					title={t('collection/views/collection-detail___bladwijzer')}
					type="secondary"
					icon="bookmark"
					ariaLabel={t('collection/views/collection-detail___bladwijzer')}
				/>
				<Button
					title={t('collection/views/collection-detail___deel')}
					type="secondary"
					icon="share-2"
					ariaLabel={t('collection/views/collection-detail___deel')}
				/>
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
							ariaLabel={t('collection/views/collection-detail___meer-opties')}
							title={t('collection/views/collection-detail___meer-opties')}
						/>
					</DropdownButton>
					<DropdownContent>
						<MenuContent menuItems={BUNDLE_DROPDOWN_ITEMS} onClick={onClickDropdownItem} />
					</DropdownContent>
				</ControlledDropdown>
				{permissions.canEditCollections && (
					<Spacer margin="left-small">
						<Button
							type="primary"
							icon="edit"
							label={t('collection/views/collection-detail___bewerken')}
							onClick={onEditCollection}
						/>
					</Spacer>
				)}
			</ButtonToolbar>
		);
	};

	const renderCollection = () => {
		const {
			id,
			is_public,
			profile,
			collection_fragments,
			lom_context,
			updated_at,
			title,
			lom_classification,
		} = bundle as Avo.Collection.Collection;

		if (!isFirstRender) {
			setIsPublic(is_public);
			setIsFirstRender(true);
		}

		return (
			<>
				<Header
					title={title}
					onClickTitle={() => null}
					category="collection"
					showMetaData
					bookmarks="0" // TODO: Real bookmark count
					views="0" // TODO: Real view count
				>
					<HeaderButtons>{renderHeaderButtons()}</HeaderButtons>
					<HeaderAvatar>{profile && renderAvatar(profile, { includeRole: true })}</HeaderAvatar>
				</Header>
				<Container mode="vertical">
					<Container mode="horizontal">
						<CollectionList
							collectionFragments={collection_fragments}
							history={history}
							location={location}
							match={match}
							user={user}
						/>
					</Container>
				</Container>
				<Container mode="vertical">
					<Container mode="horizontal">
						<h3 className="c-h3">
							<Trans>Info over deze bundel</Trans>
						</h3>
						<Grid>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">
										<Trans i18nKey="collection/views/collection-detail___onderwijsniveau">
											Onderwijsniveau
										</Trans>
									</p>
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
									<p className="u-text-bold">
										<Trans i18nKey="collection/views/collection-detail___laatst-aangepast">
											Laatst aangepast
										</Trans>
									</p>
									<p className="c-body-1">{formatDate(updated_at)}</p>
								</Spacer>
							</Column>
							<Column size="3-6">
								<p className="u-text-bold">
									<Trans i18nKey="collection/views/collection-detail___ordering">Ordering</Trans>
								</p>
								{/* TODO: add links */}
								<p className="c-body-1">
									<Trans>Deze bundel is een kopie van:</Trans>
								</p>
							</Column>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">
										<Trans i18nKey="collection/views/collection-detail___vakken">Vakken</Trans>
									</p>
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
						<BlockHeading type="h3">
							<Trans i18nKey="collection/views/collection-detail___bekijk-ook">Bekijk ook</Trans>
						</BlockHeading>
						{renderRelatedBundles()}
					</Container>
				</Container>
				{/*{isPublic !== null && (*/}
				{/*	<ShareCollectionModal*/}
				{/*		collection={{ ...(collection as Avo.Collection.Collection), is_public: isPublic }}*/}
				{/*		isOpen={isShareModalOpen}*/}
				{/*		onClose={() => setIsShareModalOpen(false)}*/}
				{/*		setIsPublic={setIsPublic}*/}
				{/*		history={history}*/}
				{/*		location={location}*/}
				{/*		match={match}*/}
				{/*		user={user}*/}
				{/*	/>*/}
				{/*)}*/}
				<DeleteObjectModal
					title={t('Ben je zeker dat de bundel {{title}} wil verwijderen?', { title })}
					body={t('Deze actie kan niet ongedaan gemaakt worden')}
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={() => onDeleteBundle()}
				/>
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			render={renderCollection}
			dataObject={permissions}
			loadingInfo={loadingInfo}
			showSpinner={true}
		/>
	);
};

export default withRouter(BundleDetail);
