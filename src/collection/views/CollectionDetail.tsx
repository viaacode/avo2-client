import { useMutation } from '@apollo/react-hooks';
import { isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { withRouter } from 'react-router';
import { Link } from 'react-router-dom';

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
	ToggleButton,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import {
	PermissionNames,
	PermissionService,
} from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH } from '../../constants';
import {
	ControlledDropdown,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
	ShareThroughEmailModal,
} from '../../shared/components';
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
import { BookmarksViewsPlaysService, ToastService } from '../../shared/services';
import {
	BookmarkViewPlayCounts,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { trackEvents } from '../../shared/services/event-logging-service';

import {
	DELETE_COLLECTION,
	INSERT_COLLECTION,
	INSERT_COLLECTION_FRAGMENTS,
} from '../collection.gql';
import { CollectionService } from '../collection.service';
import { ContentTypeString, toEnglishContentType } from '../collection.types';
import { FragmentList, ShareCollectionModal } from '../components';
import AddToBundleModal from '../components/modals/AddToBundleModal';
import './CollectionDetail.scss';

export const COLLECTION_COPY = 'Kopie %index%: ';
export const COLLECTION_COPY_REGEX = /^Kopie [0-9]+: /gi;
const CONTENT_TYPE: DutchContentType = ContentTypeString.collection;

interface CollectionDetailProps extends DefaultSecureRouteProps<{ id: string }> {}

const CollectionDetail: FunctionComponent<CollectionDetailProps> = ({
	history,
	location,
	match,
	user,
}) => {
	const [t] = useTranslation();

	// State
	const [collectionId, setCollectionId] = useState(match.params.id);
	const [collection, setCollection] = useState<Avo.Collection.Collection | null>(null);
	const [publishedBundles, setPublishedBundles] = useState<Avo.Collection.Collection[]>([]);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isShareThroughEmailModalOpen, setIsShareThroughEmailModalOpen] = useState(false);
	const [isAddToBundleModalOpen, setIsAddToBundleModalOpen] = useState<boolean>(false);
	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [isPublic, setIsPublic] = useState<boolean | null>(null);
	const [relatedCollections /*, setRelatedCollections */] = useState<
		Avo.Search.ResultItem[] | null
	>(null);
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
	const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);

	// Mutations
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionInsert] = useMutation(INSERT_COLLECTION);
	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);

	useEffect(() => {
		trackEvents(
			{
				object: collectionId,
				object_type: 'collections',
				message: `Gebruiker ${getProfileName(
					user
				)} heeft de pagina voor collectie ${collectionId} bekeken`,
				action: 'view',
			},
			user
		);
	});

	useEffect(() => {
		const checkPermissionsAndGetCollection = async () => {
			try {
				const uuid = await CollectionService.getCollectionIdByAvo1Id(collectionId);

				if (!uuid) {
					setLoadingInfo({
						state: 'error',
						message: t(
							'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden'
						),
						icon: 'alert-triangle',
					});
					return;
				}

				if (collectionId !== uuid) {
					// Redirect to new url that uses the collection uuid instead of the collection avo1 id
					// and continue loading the collection
					redirectToClientPage(
						buildLink(APP_PATH.COLLECTION_DETAIL.route, { id: uuid }),
						history
					);
				}

				const rawPermissions = await Promise.all([
					PermissionService.hasPermissions(
						[
							{ name: PermissionNames.VIEW_COLLECTIONS },
							{
								name: PermissionNames.VIEW_COLLECTIONS_LINKED_TO_ASSIGNMENT,
								obj: collectionId,
							},
						],
						user
					),
					PermissionService.hasPermissions(
						[
							{ name: PermissionNames.EDIT_OWN_COLLECTIONS, obj: collectionId },
							{ name: PermissionNames.EDIT_ANY_COLLECTIONS },
						],
						user
					),
					PermissionService.hasPermissions(
						[
							{ name: PermissionNames.DELETE_OWN_COLLECTIONS, obj: collectionId },
							{ name: PermissionNames.DELETE_ANY_COLLECTIONS },
						],
						user
					),
					PermissionService.hasPermissions(
						[{ name: PermissionNames.CREATE_COLLECTIONS }],
						user
					),
					PermissionService.hasPermissions([{ name: PermissionNames.VIEW_ITEMS }], user),
				]);
				const permissionObj = {
					canViewCollections: rawPermissions[0],
					canEditCollections: rawPermissions[1],
					canDeleteCollections: rawPermissions[2],
					canCreateCollections: rawPermissions[3],
					canViewItems: rawPermissions[4],
				};
				const collectionObj = await CollectionService.fetchCollectionsOrBundlesWithItemsById(
					uuid,
					'collection'
				);

				if (!collectionObj) {
					setLoadingInfo({
						state: 'error',
						message: t(
							'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden'
						),
						icon: 'search',
					});
					return;
				}

				BookmarksViewsPlaysService.action('view', 'collection', collectionObj.id, user);
				try {
					const counts = await BookmarksViewsPlaysService.getCollectionCounts(
						collectionObj.id,
						user
					);
					setBookmarkViewPlayCounts(counts);
				} catch (err) {
					console.error(
						new CustomError('Failed to get getCollectionCounts', err, {
							uuid: collectionObj.id,
						})
					);
					ToastService.danger(
						t(
							'collection/views/collection-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
						)
					);
				}

				// Get published bundles that contain this collection
				const publishedBundlesList = await CollectionService.getPublishedBundlesContainingCollection(
					collectionObj.id
				);

				setCollectionId(uuid);
				setPermissions(permissionObj);
				setCollection(collectionObj || null);
				setPublishedBundles(publishedBundlesList);
			} catch (err) {
				console.error(
					new CustomError(
						'Failed to check permissions or get collection from the database',
						err,
						{
							collectionId,
						}
					)
				);
				setLoadingInfo({
					state: 'error',
					message: t(
						'collection/views/collection-detail___er-ging-iets-mis-tijdens-het-ophalen-van-de-collectie'
					),
					icon: 'alert-triangle',
				});
			}
		};

		checkPermissionsAndGetCollection();
	}, [collectionId, t, user, history]);

	// Waiting for ES index for bundles
	// useEffect(() => {
	// 	if (!relatedCollections) {
	// 		getRelatedItems(collectionId, 'collections', 4)
	// 			.then(relatedItems => setRelatedCollections(relatedItems))
	// 			.catch(err => {
	// 				console.error('Failed to get related items', err, {
	// 					collectionId,
	// 					index: 'collections',
	// 					limit: 4,
	// 				});
	// 				ToastService.danger(t('collection/views/collection-detail___het-ophalen-van-de-gerelateerde-collecties-is-mislukt'));
	// 			});
	// 	}
	// }, [relatedCollections, t, collectionId]);

	useEffect(() => {
		if (!isEmpty(permissions) && collection) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [permissions, collection, setLoadingInfo]);

	// Listeners
	const onEditCollection = () => {
		history.push(
			`${generateContentLinkString(ContentTypeString.collection, `${collectionId}`)}/${
				ROUTE_PARTS.edit
			}`
		);
	};

	const onClickDropdownItem = async (item: ReactText) => {
		switch (item) {
			case 'duplicate':
				try {
					if (!collection) {
						ToastService.danger(
							t(
								'collection/views/collection-detail___de-collectie-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
							)
						);
						return;
					}
					const duplicateCollection = await CollectionService.duplicateCollection(
						collection,
						user,
						COLLECTION_COPY,
						COLLECTION_COPY_REGEX,
						triggerCollectionInsert,
						triggerCollectionFragmentsInsert
					);
					redirectToClientPage(
						buildLink(APP_PATH.COLLECTION_DETAIL.route, { id: duplicateCollection.id }),
						history
					);
					setCollection(duplicateCollection);
					ToastService.success(
						t(
							'collection/views/collection-detail___de-collectie-is-gekopieerd-u-kijkt-nu-naar-de-kopie'
						)
					);
				} catch (err) {
					console.error('Failed to copy collection', err, {
						originalCollection: collection,
					});
					ToastService.danger(
						t(
							'collection/views/collection-detail___het-kopieren-van-de-collectie-is-mislukt'
						)
					);
				}
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

	const toggleBookmark = async () => {
		if (
			await BookmarksViewsPlaysService.toggleBookmark(
				collectionId,
				user,
				'collection',
				bookmarkViewPlayCounts.isBookmarked
			)
		) {
			setBookmarkViewPlayCounts({
				...bookmarkViewPlayCounts,
				isBookmarked: !bookmarkViewPlayCounts.isBookmarked,
			});
		}
	};

	const createAssignment = (): void => {
		redirectToClientPage(
			generateAssignmentCreateLink('KIJK', `${collectionId}`, 'COLLECTIE'),
			history
		);
	};

	const onDeleteCollection = (): void => {
		CollectionService.deleteCollection(history, collectionId, triggerCollectionDelete);
	};

	// Render functions
	const renderRelatedCollections = () => {
		if (!relatedCollections || !relatedCollections.length) {
			return (
				<p className="c-body-1">
					<Trans i18nKey="collection/views/collection-detail___de-gerelateerde-collecties-konden-niet-worden-opgehaald">
						De gerelateerde collecties konden niet worden opgehaald.
					</Trans>
				</p>
			);
		}

		relatedCollections.map((relatedCollection: Avo.Search.ResultItem) => {
			const {
				id,
				dc_title,
				thumbnail_path = undefined,
				original_cp = '',
			} = relatedCollection;
			const category = toEnglishContentType(CONTENT_TYPE);

			return (
				<Grid className="c-media-card-list">
					<Column size="3-6">
						<MediaCard
							category={category}
							onClick={() =>
								redirectToClientPage(
									buildLink(APP_PATH.COLLECTION_DETAIL.route, { id }),
									history
								)
							}
							orientation="horizontal"
							title={dc_title}
						>
							<MediaCardThumbnail>
								<Thumbnail category={category} src={thumbnail_path} />
							</MediaCardThumbnail>
							<MediaCardMetaData>
								<MetaData category={category}>
									<MetaDataItem label={original_cp || undefined} />
								</MetaData>
							</MediaCardMetaData>
						</MediaCard>
					</Column>
				</Grid>
			);
		});
	};

	const renderHeaderButtons = () => {
		const COLLECTION_DROPDOWN_ITEMS = [
			// TODO: DISABLED_FEATURE - createDropdownMenuItem("play", 'Alle items afspelen')
			createDropdownMenuItem(
				'addToBundle',
				t('collection/views/collection-detail___voeg-toe-aan-bundel'),
				'plus'
			),
			...(permissions.canCreateCollections
				? [
						createDropdownMenuItem(
							'duplicate',
							t('collection/views/collection-detail___dupliceer'),
							'copy'
						),
				  ]
				: []),
			...(permissions.canDeleteCollections
				? [
						createDropdownMenuItem(
							'delete',
							t('collection/views/collection-detail___verwijder')
						),
				  ]
				: []),
		];
		return (
			<ButtonToolbar>
				<Button
					label={t('collection/views/collection-detail___maak-opdracht')}
					type="secondary"
					icon="clipboard"
					ariaLabel={t('collection/views/collection-detail___maak-opdracht')}
					onClick={createAssignment}
				/>
				{permissions.canEditCollections && (
					<Button
						type="secondary"
						label={t('collection/views/collection-detail___delen')}
						onClick={() => setIsShareModalOpen(!isShareModalOpen)}
					/>
				)}
				<ToggleButton
					title={t('collection/views/collection-detail___bladwijzer')}
					type="secondary"
					icon="bookmark"
					active={bookmarkViewPlayCounts.isBookmarked}
					ariaLabel={t('collection/views/collection-detail___bladwijzer')}
					onClick={toggleBookmark}
				/>
				<Button
					title={t('collection/views/collection-detail___deel')}
					type="secondary"
					icon="share-2"
					ariaLabel={t('collection/views/collection-detail___deel')}
					onClick={() => setIsShareThroughEmailModalOpen(true)}
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
						<MenuContent
							menuItems={COLLECTION_DROPDOWN_ITEMS}
							onClick={onClickDropdownItem}
						/>
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
		} = collection as Avo.Collection.Collection;

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
					bookmarks={String(bookmarkViewPlayCounts.bookmarkCount)}
					views={String(bookmarkViewPlayCounts.viewCount)}
				>
					<HeaderButtons>{renderHeaderButtons()}</HeaderButtons>
					<HeaderAvatar>
						{profile && renderAvatar(profile, { includeRole: true, dark: true })}
					</HeaderAvatar>
				</Header>
				<Container mode="vertical">
					<Container mode="horizontal">
						<FragmentList
							collectionFragments={collection_fragments}
							showDescription
							linkToItems={permissions.canViewItems || false}
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
							<Trans i18nKey="collection/views/collection-detail___info-over-deze-collectie">
								Info over deze collectie
							</Trans>
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
											generateSearchLinks(
												`${id}`,
												'educationLevel',
												lom_context
											)
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
									<Trans i18nKey="collection/views/collection-detail___ordering">
										Ordering
									</Trans>
								</p>
								{/* TODO: add links */}
								<p className="c-body-1">
									<Trans i18nKey="collection/views/collection-detail___deze-collectie-is-een-kopie-van">
										Deze collectie is een kopie van:
									</Trans>
								</p>
								<p className="c-body-1">
									<Trans i18nKey="collection/views/collection-detail___deze-collectie-is-deel-van-een-map">
										Deze collectie is deel van een bundel:
									</Trans>{' '}
									{publishedBundles.map((bundle, index) => {
										return (
											<>
												{index !== 0 && !!publishedBundles.length && ', '}
												<Link
													to={buildLink(APP_PATH.BUNDLE_DETAIL.route, {
														id: bundle.id,
													})}
												>
													{bundle.title}
												</Link>
											</>
										);
									})}
								</p>
							</Column>
							<Column size="3-3">
								<Spacer margin="top">
									<p className="u-text-bold">
										<Trans i18nKey="collection/views/collection-detail___vakken">
											Vakken
										</Trans>
									</p>
									<p className="c-body-1">
										{lom_classification && lom_classification.length ? (
											generateSearchLinks(
												`${id}`,
												'subject',
												lom_classification
											)
										) : (
											<span className="u-d-block">-</span>
										)}
									</p>
								</Spacer>
							</Column>
						</Grid>
						<hr className="c-hr" />
						<BlockHeading type="h3">
							<Trans i18nKey="collection/views/collection-detail___bekijk-ook">
								Bekijk ook
							</Trans>
						</BlockHeading>
						{renderRelatedCollections()}
					</Container>
				</Container>
				{isPublic !== null && (
					<ShareCollectionModal
						collection={{
							...(collection as Avo.Collection.Collection),
							is_public: isPublic,
						}}
						isOpen={isShareModalOpen}
						onClose={() => setIsShareModalOpen(false)}
						setIsPublic={setIsPublic}
						history={history}
						location={location}
						match={match}
						user={user}
					/>
				)}
				{collectionId !== undefined && (
					<AddToBundleModal
						history={history}
						location={location}
						match={match}
						user={user}
						collection={collection as Avo.Collection.Collection}
						collectionId={collectionId as string}
						isOpen={isAddToBundleModalOpen}
						onClose={() => setIsAddToBundleModalOpen(false)}
					/>
				)}
				<DeleteObjectModal
					title={t(
						'collection/views/collection-detail___ben-je-zeker-dat-je-deze-collectie-wil-verwijderen'
					)}
					body={t(
						'collection/views/collection-detail___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={onDeleteCollection}
				/>
				<ShareThroughEmailModal
					modalTitle={t('collection/views/collection-detail___deel-deze-collectie')}
					type="collection"
					emailLinkHref={window.location.href}
					emailLinkTitle={(collection as Avo.Collection.Collection).title}
					isOpen={isShareThroughEmailModalOpen}
					onClose={() => setIsShareThroughEmailModalOpen(false)}
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

export default withRouter(CollectionDetail);
