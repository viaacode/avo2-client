import {
	Button,
	ButtonToolbar,
	Column,
	Container,
	Dropdown,
	Grid,
	Header,
	HeaderButtons,
	HeaderRow,
	MenuContent,
	Spacer,
	ToggleButton,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { CollectionSchema } from '@viaa/avo2-types/types/collection';
import classnames from 'classnames';
import { get, isEmpty, isNil } from 'lodash-es';
import React, { FunctionComponent, ReactText, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { withRouter } from 'react-router';
import { Link, RouteComponentProps } from 'react-router-dom';
import { compose } from 'redux';

import { AssignmentService } from '../../assignment/assignment.service';
import ConfirmImportToAssignmentWithResponsesModal from '../../assignment/modals/ConfirmImportToAssignmentWithResponsesModal';
import CreateAssignmentModal from '../../assignment/modals/CreateAssignmentModal';
import ImportToAssignmentModal from '../../assignment/modals/ImportToAssignmentModal';
import { getProfileId } from '../../authentication/helpers/get-profile-id';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import RegisterOrLogin from '../../authentication/views/RegisterOrLogin';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ALL_SEARCH_FILTERS, SearchFilter } from '../../search/search.const';
import {
	InteractiveTour,
	LoadingErrorLoadedComponent,
	LoadingInfo,
	ShareThroughEmailModal,
} from '../../shared/components';
import JsonLd from '../../shared/components/JsonLd/JsonLd';
import MoreOptionsDropdown from '../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
import QuickLaneModal from '../../shared/components/QuickLaneModal/QuickLaneModal';
import { ROUTE_PARTS } from '../../shared/constants';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	generateContentLinkString,
	getFullName,
	isMobileWidth,
	renderAvatar,
} from '../../shared/helpers';
import {
	defaultGoToDetailLink,
	defaultRenderDetailLink,
} from '../../shared/helpers/default-render-detail-link';
import { defaultRenderSearchLink } from '../../shared/helpers/default-render-search-link';
import { isUuid } from '../../shared/helpers/uuid';
import withUser, { UserProps } from '../../shared/hocs/withUser';
import { BookmarksViewsPlaysService, ToastService } from '../../shared/services';
import { DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS } from '../../shared/services/bookmarks-views-plays-service';
import { BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import { getRelatedItems } from '../../shared/services/related-items-service';
import { renderCommonMetadata, renderRelatedItems } from '../collection.helpers';
import { CollectionService } from '../collection.service';
import { ContentTypeString, Relation } from '../collection.types';
import {
	AutoplayCollectionModal,
	BlockList,
	FragmentList,
	PublishCollectionModal,
} from '../components';
import AddToBundleModal from '../components/modals/AddToBundleModal';
import DeleteCollectionModal from '../components/modals/DeleteCollectionModal';

import './CollectionDetail.scss';

export const COLLECTION_COPY = 'Kopie %index%: ';
export const COLLECTION_COPY_REGEX = /^Kopie [0-9]+: /gi;

export const COLLECTION_ACTIONS = {
	duplicate: 'duplicate',
	addToBundle: 'addToBundle',
	delete: 'delete',
	openShareThroughEmail: 'openShareThroughEmail',
	openPublishCollectionModal: 'openPublishCollectionModal',
	toggleBookmark: 'toggleBookmark',
	createAssignment: 'createAssignment',
	importToAssignment: 'importToAssignment',
	editCollection: 'editCollection',
	openQuickLane: 'openQuickLane',
	openAutoplayCollectionModal: 'openAutoplayCollectionModal',
};

type CollectionDetailPermissions = Partial<{
	canViewCollections: boolean;
	canViewPublishedCollections: boolean;
	canViewUnpublishedCollections: boolean;
	canEditCollections: boolean;
	canPublishCollections: boolean;
	canDeleteCollections: boolean;
	canCreateCollections: boolean;
	canViewAnyPublishedItems: boolean;
	canCreateQuickLane: boolean;
	canAutoplayCollection: boolean;
	canCreateAssignments: boolean;
	canCreateBundles: boolean;
}>;

type CollectionDetailProps = {
	id?: string; // Item id when component needs to be used inside another component and the id cannot come from the url (match.params.id)
	enabledMetaData: SearchFilter[];
};

const CollectionDetail: FunctionComponent<
	CollectionDetailProps & UserProps & RouteComponentProps<{ id: string }>
> = ({ history, location, match, user, id, enabledMetaData = ALL_SEARCH_FILTERS }) => {
	const [t] = useTranslation();

	// State
	const [collectionId, setCollectionId] = useState(id || match.params.id);

	const [collectionInfo, setCollectionInfo] = useState<{
		collection: Avo.Collection.Collection | null;
		permissions: CollectionDetailPermissions;
		showLoginPopup: boolean;
	} | null>(null);
	const permissions = collectionInfo?.permissions;
	const showLoginPopup = collectionInfo?.showLoginPopup;
	const collection = collectionInfo?.collection;

	const [publishedBundles, setPublishedBundles] = useState<Avo.Collection.Collection[]>([]);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isShareThroughEmailModalOpen, setIsShareThroughEmailModalOpen] = useState(false);
	const [isAddToBundleModalOpen, setIsAddToBundleModalOpen] = useState<boolean>(false);
	const [isAutoplayCollectionModalOpen, setIsAutoplayCollectionModalOpen] =
		useState<boolean>(false);
	const [isQuickLaneModalOpen, setIsQuickLaneModalOpen] = useState(false);
	const [isCreateAssignmentDropdownOpen, setIsCreateAssignmentDropdownOpen] =
		useState<boolean>(false);
	const [isCreateAssignmentModalOpen, setIsCreateAssignmentModalOpen] = useState<boolean>(false);
	const [isImportToAssignmentModalOpen, setIsImportToAssignmentModalOpen] =
		useState<boolean>(false);
	const [
		isConfirmImportToAssignmentWithResponsesModalOpen,
		setIsConfirmImportToAssignmentWithResponsesModalOpen,
	] = useState<boolean>(false);

	const [isFirstRender, setIsFirstRender] = useState<boolean>(false);
	const [relatedCollections, setRelatedCollections] = useState<Avo.Search.ResultItem[] | null>(
		null
	);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);

	const [assignmentId, setAssignmentId] = useState<string>();
	const [importWithDescription, setImportWithDescription] = useState<boolean>(false);

	const getRelatedCollections = useCallback(async () => {
		try {
			if (isUuid(collectionId)) {
				setRelatedCollections(await getRelatedItems(collectionId, 'collections', 4));
			}
		} catch (err) {
			console.error('Failed to get related items', err, {
				collectionId,
				index: 'collections',
				limit: 4,
			});

			ToastService.danger(
				t(
					'collection/views/collection-detail___het-ophalen-van-de-gerelateerde-collecties-is-mislukt'
				)
			);
		}
	}, [setRelatedCollections, t, collectionId]);

	/**
	 * Get published bundles that contain this collection
	 */
	const getPublishedBundles = useCallback(async () => {
		try {
			if (isUuid(collectionId)) {
				setPublishedBundles(
					await CollectionService.getPublishedBundlesContainingCollection(collectionId)
				);
			}
		} catch (err) {
			console.error('Failed to get published bundles containing this collection', err, {
				collectionId,
			});

			ToastService.danger(
				t('Het ophalen van de gepubliceerde bundels die deze collectie bevatten is mislukt')
			);
		}
	}, [setPublishedBundles, t, collectionId]);

	const triggerEvents = useCallback(async () => {
		// Do not trigger events when a search engine loads this page
		if (collection?.id && user && !showLoginPopup) {
			trackEvents(
				{
					object: collectionId,
					object_type: 'collection',
					action: 'view',
				},
				user
			);

			BookmarksViewsPlaysService.action('view', 'collection', collection.id, user);
			try {
				setBookmarkViewPlayCounts(
					await BookmarksViewsPlaysService.getCollectionCounts(collection.id, user)
				);
			} catch (err) {
				console.error(
					new CustomError('Failed to get getCollectionCounts', err, {
						uuid: collection.id,
					})
				);
				ToastService.danger(
					t(
						'collection/views/collection-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
					)
				);
			}
		}
	}, [setPublishedBundles, t, collection?.id, user, showLoginPopup]);

	useEffect(() => {
		setCollectionId(id || match.params.id);
	}, [id, match.params.id]);

	useEffect(() => {
		if (!isFirstRender && collection) {
			setIsFirstRender(true);
		}
	}, [collection, isFirstRender, setIsFirstRender]);

	const checkPermissionsAndGetCollection = useCallback(async () => {
		try {
			if (!user) {
				return;
			}
			let uuid;
			if (isUuid(collectionId)) {
				uuid = collectionId;
			} else {
				uuid = await CollectionService.fetchUuidByAvo1Id(collectionId);

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

				// Redirect to new url that uses the collection uuid instead of the collection avo1 id
				// and continue loading the collection
				defaultGoToDetailLink(history)(uuid, 'collectie');

				return;
			}

			const rawPermissions = await Promise.all([
				PermissionService.hasPermissions(
					{ name: PermissionName.VIEW_OWN_COLLECTIONS, obj: collectionId },
					user
				),
				PermissionService.hasPermissions(
					[
						{
							name: PermissionName.VIEW_ANY_PUBLISHED_COLLECTIONS,
						},
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{
							name: PermissionName.VIEW_ANY_UNPUBLISHED_COLLECTIONS,
						},
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{ name: PermissionName.EDIT_OWN_COLLECTIONS, obj: collectionId },
						{ name: PermissionName.EDIT_ANY_COLLECTIONS },
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{ name: PermissionName.PUBLISH_OWN_COLLECTIONS, obj: collectionId },
						{ name: PermissionName.PUBLISH_ANY_COLLECTIONS },
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{ name: PermissionName.DELETE_OWN_COLLECTIONS, obj: collectionId },
						{ name: PermissionName.DELETE_ANY_COLLECTIONS },
					],
					user
				),
				PermissionService.hasPermissions(
					[{ name: PermissionName.CREATE_COLLECTIONS }],
					user
				),
				PermissionService.hasPermissions(
					[{ name: PermissionName.VIEW_ANY_PUBLISHED_ITEMS }],
					user
				),
				PermissionService.hasPermissions(
					[{ name: PermissionName.CREATE_QUICK_LANE }],
					user
				),
				PermissionService.hasPerm(user, PermissionName.AUTOPLAY_COLLECTION),
				PermissionService.hasPerm(user, PermissionName.CREATE_ASSIGNMENTS),
				PermissionService.hasPerm(user, PermissionName.CREATE_BUNDLES),
			]);

			const permissionObj: CollectionDetailPermissions = {
				canViewCollections: rawPermissions[0],
				canViewPublishedCollections: rawPermissions[1],
				canViewUnpublishedCollections: rawPermissions[2],
				canEditCollections: rawPermissions[3],
				canPublishCollections: rawPermissions[4],
				canDeleteCollections: rawPermissions[5],
				canCreateCollections: rawPermissions[6],
				canViewAnyPublishedItems: rawPermissions[7],
				canCreateQuickLane: rawPermissions[8],
				canAutoplayCollection: rawPermissions[9],
				canCreateAssignments: rawPermissions[10],
				canCreateBundles: rawPermissions[11],
			};

			let showPopup = false;

			if (
				!permissionObj.canViewCollections &&
				!permissionObj.canViewPublishedCollections &&
				!permissionObj.canViewUnpublishedCollections
			) {
				showPopup = true;
			}

			const collectionObj = await CollectionService.fetchCollectionOrBundleById(
				uuid,
				'collection',
				undefined
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

			if (
				(!permissionObj.canViewCollections &&
					collectionObj.is_public &&
					!permissionObj.canViewPublishedCollections) ||
				(!permissionObj.canViewCollections &&
					!collectionObj.is_public &&
					!permissionObj.canViewUnpublishedCollections)
			) {
				showPopup = true;
			}

			setCollectionInfo({
				showLoginPopup: showPopup,
				permissions: permissionObj,
				collection: collectionObj || null,
			});
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
		// Ensure callback only runs once even if user object is set twice // TODO investigate why user object is set twice
	}, [collectionId, setCollectionInfo, t, user, history, defaultGoToDetailLink]);

	useEffect(() => {
		checkPermissionsAndGetCollection();
	}, [checkPermissionsAndGetCollection]);

	useEffect(() => {
		getRelatedCollections();
	}, [getRelatedCollections]);

	useEffect(() => {
		getPublishedBundles();
	}, [getPublishedBundles]);

	useEffect(() => {
		triggerEvents();
	}, [triggerEvents]);

	useEffect(() => {
		if (!isEmpty(permissions) && collection && !isNil(showLoginPopup)) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [permissions, collection, setLoadingInfo, showLoginPopup]);

	// Listeners
	const onEditCollection = () => {
		history.push(
			`${generateContentLinkString(ContentTypeString.collection, `${collectionId}`)}/${
				ROUTE_PARTS.edit
			}`
		);
	};

	const executeAction = async (item: ReactText) => {
		setIsOptionsMenuOpen(false);
		setIsCreateAssignmentDropdownOpen(false);
		switch (item) {
			case COLLECTION_ACTIONS.duplicate:
				try {
					if (!collection) {
						ToastService.danger(
							t(
								'collection/views/collection-detail___de-collectie-kan-niet-gekopieerd-worden-omdat-deze-nog-niet-is-opgehaald-van-de-database'
							)
						);
						return;
					}
					if (!user) {
						ToastService.danger(
							t(
								'collection/views/collection-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
							)
						);
						return;
					}
					const duplicateCollection = await CollectionService.duplicateCollection(
						collection,
						user,
						COLLECTION_COPY,
						COLLECTION_COPY_REGEX
					);

					trackEvents(
						{
							object: collection.id,
							object_type: 'collection',
							action: 'copy',
						},
						user
					);

					defaultGoToDetailLink(history)(duplicateCollection.id, 'collectie');
					setCollectionId(duplicateCollection.id);
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

			case COLLECTION_ACTIONS.addToBundle:
				setIsAddToBundleModalOpen(true);
				break;

			case COLLECTION_ACTIONS.delete:
				setIsDeleteModalOpen(true);
				break;

			case COLLECTION_ACTIONS.openShareThroughEmail:
				setIsShareThroughEmailModalOpen(true);
				break;

			case COLLECTION_ACTIONS.openPublishCollectionModal:
				setIsPublishModalOpen(!isPublishModalOpen);
				break;

			case COLLECTION_ACTIONS.toggleBookmark:
				await toggleBookmark();
				break;

			case COLLECTION_ACTIONS.createAssignment:
				setIsCreateAssignmentModalOpen(true);
				break;

			case COLLECTION_ACTIONS.importToAssignment:
				setIsImportToAssignmentModalOpen(true);
				break;

			case COLLECTION_ACTIONS.editCollection:
				onEditCollection();
				break;
			case COLLECTION_ACTIONS.openAutoplayCollectionModal:
				setIsAutoplayCollectionModalOpen(!isAutoplayCollectionModalOpen);
				break;

			case COLLECTION_ACTIONS.openQuickLane:
				setIsQuickLaneModalOpen(true);
				break;

			default:
				console.warn(`An unhandled action "${item}" was executed without a binding.`);
				return null;
		}
	};

	const toggleBookmark = async () => {
		try {
			if (!user) {
				ToastService.danger(
					t(
						'collection/views/collection-detail___er-was-een-probleem-met-het-controleren-van-de-ingelogde-gebruiker-log-opnieuw-in-en-probeer-opnieuw'
					)
				);
				return;
			}
			await BookmarksViewsPlaysService.toggleBookmark(
				collectionId,
				user,
				'collection',
				bookmarkViewPlayCounts.isBookmarked
			);
			setBookmarkViewPlayCounts({
				...bookmarkViewPlayCounts,
				isBookmarked: !bookmarkViewPlayCounts.isBookmarked,
			});
			ToastService.success(
				bookmarkViewPlayCounts.isBookmarked
					? t('collection/views/collection-detail___de-bladwijzer-is-verwijderd')
					: t('collection/views/collection-detail___de-bladwijzer-is-aangemaakt')
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle bookmark', err, {
					collectionId,
					user,
					type: 'collection',
					isBookmarked: bookmarkViewPlayCounts.isBookmarked,
				})
			);
			ToastService.danger(
				bookmarkViewPlayCounts.isBookmarked
					? t(
							'collection/views/collection-detail___het-verwijderen-van-de-bladwijzer-is-mislukt'
					  )
					: t(
							'collection/views/collection-detail___het-aanmaken-van-de-bladwijzer-is-mislukt'
					  )
			);
		}
	};

	const onDeleteCollection = async (): Promise<void> => {
		try {
			await CollectionService.deleteCollection(collectionId);

			trackEvents(
				{
					object: collectionId,
					object_type: 'collection',
					action: 'delete',
				},
				user
			);

			history.push(APP_PATH.WORKSPACE.route);
			ToastService.success(
				t('collection/views/collection-detail___de-collectie-werd-succesvol-verwijderd')
			);
		} catch (err) {
			ToastService.danger(
				t(
					'collection/views/collection-detail___het-verwijderen-van-de-collectie-is-mislukt'
				)
			);
		}
	};

	const onCreateAssignment = async (withDescription: boolean): Promise<void> => {
		if (user && collection) {
			const assignmentId = await AssignmentService.createAssignmentFromCollection(
				user,
				collection,
				withDescription
			);

			history.push(buildLink(APP_PATH.ASSIGNMENT_EDIT.route, { id: assignmentId }));
		}
	};

	const onImportToAssignment = async (
		importToAssignmentId: string,
		withDescription: boolean
	): Promise<void> => {
		setAssignmentId(importToAssignmentId);

		setImportWithDescription(withDescription);

		// check if assignment has responses. If so: show additional confirmation modal
		const hasResponses = await AssignmentService.getAssignmentResponses(
			getProfileId(user),
			importToAssignmentId
		);
		if (hasResponses.length > 0) {
			setIsConfirmImportToAssignmentWithResponsesModalOpen(true);
		} else {
			doImportToAssignment(importToAssignmentId, withDescription);
		}
	};

	const onConfirmImportAssignment = () => {
		if (!assignmentId) {
			return;
		}
		return doImportToAssignment(assignmentId, importWithDescription);
	};

	const doImportToAssignment = async (
		importToAssignmentId: string,
		withDescription: boolean
	): Promise<void> => {
		setIsConfirmImportToAssignmentWithResponsesModalOpen(false);
		if (collection && importToAssignmentId) {
			await AssignmentService.importCollectionToAssignment(
				collection,
				importToAssignmentId,
				withDescription
			);
			ToastService.success(
				t(
					'collection/views/collection-detail___de-collectie-is-geimporteerd-naar-de-opdracht'
				)
			);
		} else {
			ToastService.danger(
				t(
					'collection/views/collection-detail___de-collectie-kon-niet-worden-geimporteerd-naar-de-opdracht'
				)
			);
		}
	};

	// Render functions

	const renderHeaderButtons = () => {
		const COLLECTION_DROPDOWN_ITEMS = [
			...(permissions?.canCreateBundles
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.addToBundle,
							t('collection/views/collection-detail___voeg-toe-aan-bundel'),
							'plus'
						),
				  ]
				: []),
			...(permissions?.canCreateQuickLane && permissions?.canCreateAssignments
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.openQuickLane,
							t('collection/views/collection-detail___delen-met-leerlingen'),
							'link-2'
						),
				  ]
				: []),
			...(permissions?.canCreateCollections
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.duplicate,
							t('collection/views/collection-detail___dupliceer'),
							'copy'
						),
				  ]
				: []),
			...(permissions?.canDeleteCollections
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.delete,
							t('collection/views/collection-detail___verwijder')
						),
				  ]
				: []),
		];

		const isPublic = !!collection && collection.is_public;

		const createAssignmentOptions = [
			{
				label: t('collection/views/collection-detail___nieuwe-opdracht'),
				id: COLLECTION_ACTIONS.createAssignment,
			},
			{
				label: t('collection/views/collection-detail___bestaande-opdracht'),
				id: COLLECTION_ACTIONS.importToAssignment,
			},
		];

		return (
			<ButtonToolbar>
				{permissions?.canAutoplayCollection && (
					<Button
						type="secondary"
						label={t('collection/views/collection-detail___speel-de-collectie-af')}
						title={t('collection/views/collection-detail___speel-de-collectie-af')}
						ariaLabel={t('collection/views/collection-detail___speelt-de-collectie-af')}
						icon="play"
						onClick={() =>
							executeAction(COLLECTION_ACTIONS.openAutoplayCollectionModal)
						}
					/>
				)}
				{permissions?.canCreateAssignments && (
					<Dropdown
						label={t('collection/views/collection-detail___importeer-naar-opdracht')}
						isOpen={isCreateAssignmentDropdownOpen}
						onClose={() => setIsCreateAssignmentDropdownOpen(false)}
						onOpen={() => setIsCreateAssignmentDropdownOpen(true)}
					>
						<MenuContent menuItems={createAssignmentOptions} onClick={executeAction} />
					</Dropdown>
				)}
				{permissions?.canCreateQuickLane && !permissions?.canCreateAssignments && (
					<Button
						type="secondary"
						icon="link-2"
						label={t('item/views/item___delen-met-leerlingen')}
						ariaLabel={t('collection/views/collection-detail___delen-met-leerlingen')}
						title={t('collection/views/collection-detail___delen-met-leerlingen')}
						onClick={() => executeAction(COLLECTION_ACTIONS.openQuickLane)}
					/>
				)}
				{permissions?.canPublishCollections && (
					<Button
						type="secondary"
						title={
							isPublic
								? t(
										'collection/views/collection-detail___maak-deze-collectie-prive'
								  )
								: t(
										'collection/views/collection-detail___maak-deze-collectie-openbaar'
								  )
						}
						ariaLabel={
							isPublic
								? t(
										'collection/views/collection-detail___maak-deze-collectie-prive'
								  )
								: t(
										'collection/views/collection-detail___maak-deze-collectie-openbaar'
								  )
						}
						icon={isPublic ? 'unlock-3' : 'lock'}
						onClick={() => executeAction(COLLECTION_ACTIONS.openPublishCollectionModal)}
					/>
				)}
				<ToggleButton
					title={t('collection/views/collection-detail___bladwijzer')}
					type="secondary"
					icon="bookmark"
					active={bookmarkViewPlayCounts.isBookmarked}
					ariaLabel={t('collection/views/collection-detail___bladwijzer')}
					onClick={() => executeAction(COLLECTION_ACTIONS.toggleBookmark)}
				/>
				{isPublic && (
					<Button
						title={t('collection/views/collection-detail___deel')}
						type="secondary"
						icon="share-2"
						ariaLabel={t('collection/views/collection-detail___deel')}
						onClick={() => executeAction(COLLECTION_ACTIONS.openShareThroughEmail)}
					/>
				)}
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					menuItems={COLLECTION_DROPDOWN_ITEMS}
					onOptionClicked={executeAction}
				/>
				{permissions?.canEditCollections && (
					<Spacer margin="left-small">
						<Button
							type="primary"
							icon="edit"
							label={t('collection/views/collection-detail___bewerken')}
							title={t('collection/views/collection-detail___pas-deze-collectie-aan')}
							onClick={() => executeAction(COLLECTION_ACTIONS.editCollection)}
						/>
					</Spacer>
				)}
				<InteractiveTour showButton />
			</ButtonToolbar>
		);
	};

	const renderHeaderButtonsMobile = () => {
		const COLLECTION_DROPDOWN_ITEMS_MOBILE = [
			...(permissions?.canEditCollections
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.editCollection,
							t('collection/views/collection-detail___bewerken'),
							'edit'
						),
				  ]
				: []),
			...(permissions?.canCreateAssignments
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.createAssignment,
							t('collection/views/collection-detail___maak-opdracht'),
							'clipboard'
						),
				  ]
				: []),
			...(permissions?.canPublishCollections
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.openPublishCollectionModal,
							t('collection/views/collection-detail___delen'),
							'plus'
						),
				  ]
				: []),
			createDropdownMenuItem(
				COLLECTION_ACTIONS.toggleBookmark,
				bookmarkViewPlayCounts.isBookmarked
					? t('collection/views/collection-detail___verwijder-bladwijzer')
					: t('collection/views/collection-detail___maak-bladwijzer'),
				bookmarkViewPlayCounts.isBookmarked ? 'bookmark-filled' : 'bookmark'
			),
			...(!!collection && collection.is_public
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.openShareThroughEmail,
							t('collection/views/collection-detail___deel'),
							'share-2'
						),
				  ]
				: []),
			...(permissions?.canCreateBundles
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.addToBundle,
							t('collection/views/collection-detail___voeg-toe-aan-bundel'),
							'plus'
						),
				  ]
				: []),
			...(permissions?.canCreateQuickLane
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.openQuickLane,
							t('collection/views/collection-detail___delen-met-leerlingen'),
							'link-2'
						),
				  ]
				: []),
			...(permissions?.canAutoplayCollection
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.openAutoplayCollectionModal,
							t('collection/views/collection-detail___speel-de-collectie-af'),
							'play'
						),
				  ]
				: []),
			...(permissions?.canCreateCollections
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.duplicate,
							t('collection/views/collection-detail___dupliceer'),
							'copy'
						),
				  ]
				: []),
			...(permissions?.canDeleteCollections
				? [
						createDropdownMenuItem(
							COLLECTION_ACTIONS.delete,
							t('collection/views/collection-detail___verwijder')
						),
				  ]
				: []),
		];
		return (
			<ButtonToolbar>
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					menuItems={COLLECTION_DROPDOWN_ITEMS_MOBILE}
					onOptionClicked={executeAction}
				/>
			</ButtonToolbar>
		);
	};

	const renderCollection = () => {
		if (!collection) {
			return null;
		}
		const { profile, collection_fragments, title } = collection as Avo.Collection.Collection;
		const hasCopies = (get(collection, 'relations') || []).length > 0;
		const hasParentBundles = !!publishedBundles.length;

		return (
			<>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							get(
								collection,
								'title',
								t(
									'collection/views/collection-detail___collectie-detail-titel-fallback'
								)
							)
						)}
					</title>
					<meta name="description" content={get(collection, 'description') || ''} />
				</MetaTags>
				<JsonLd
					url={window.location.href}
					title={get(collection, 'title', '')}
					description={get(collection, 'description')}
					image={get(collection, 'thumbnail_path')}
					isOrganisation={!!get(collection, 'profile.organisation')}
					author={getFullName(get(collection, 'profile'), true, false)}
					publishedAt={get(collection, 'published_at')}
					updatedAt={get(collection, 'updated_at')}
					keywords={[
						...(get(collection, 'lom_classification') || []),
						...(get(collection, 'lom_context') || []),
					]}
				/>
				<div
					className={classnames(
						'm-collection-detail',
						showLoginPopup ? 'hide-behind-login-popup' : ''
					)}
				>
					<Header
						title={title}
						category="collection"
						showMetaData
						bookmarks={String(bookmarkViewPlayCounts.bookmarkCount || 0)}
						views={String(bookmarkViewPlayCounts.viewCount || 0)}
					>
						{!showLoginPopup && (
							<HeaderButtons>
								{isMobileWidth()
									? renderHeaderButtonsMobile()
									: renderHeaderButtons()}
							</HeaderButtons>
						)}

						<HeaderRow>
							<Spacer margin={'top-small'}>
								{profile && renderAvatar(profile, { dark: true })}
							</Spacer>
						</HeaderRow>
					</Header>

					{/* Start */}

					<Container mode="vertical" className="u-padding-top-l u-padding-bottom-l">
						<BlockList
							blocks={collection.collection_fragments}
							config={{
								text: {
									title: {
										canClickHeading: permissions?.canViewAnyPublishedItems,
									},
								},
								item: {
									meta: {
										canClickSeries: permissions?.canViewAnyPublishedItems,
									},
									flowPlayer: {
										canPlay:
											!isAddToBundleModalOpen &&
											!isDeleteModalOpen &&
											!isPublishModalOpen &&
											!isShareThroughEmailModalOpen &&
											!isAutoplayCollectionModalOpen,
									},
								},
							}}
						/>
					</Container>

					<br />
					<hr />
					<br />

					{/* End */}

					<Container mode="vertical">
						<Container mode="horizontal">
							{!!collection && !!user && (
								<FragmentList
									collectionFragments={collection_fragments}
									showDescription
									linkToItems={permissions?.canViewAnyPublishedItems || false}
									canPlay={
										!isAddToBundleModalOpen &&
										!isDeleteModalOpen &&
										!isPublishModalOpen &&
										!isShareThroughEmailModalOpen &&
										!isAutoplayCollectionModalOpen
									}
									history={history}
									location={location}
									match={match}
									user={user}
									collection={collection}
								/>
							)}
						</Container>
					</Container>
					<Container mode="vertical">
						<Container mode="horizontal">
							<h3 className="c-h3">
								{t('collection/views/collection-detail___info-over-deze-collectie')}
							</h3>
							<Grid>
								{!!collection &&
									renderCommonMetadata(
										collection,
										enabledMetaData,
										defaultRenderSearchLink
									)}
								{(hasCopies || hasParentBundles) && (
									<Column size="3-6">
										<Spacer margin="top-large">
											<p className="u-text-bold">
												<Trans i18nKey="collection/views/collection-detail___ordering">
													Ordering
												</Trans>
											</p>
											{hasCopies && (
												<p className="c-body-1">
													{`${t(
														'collection/views/collection-detail___deze-collectie-is-een-kopie-van'
													)} `}
													{(
														get(
															collection,
															'relations',
															[]
														) as Relation[]
													).map((relation: Relation) => (
														<Link
															key={`copy-of-link-${relation.object_meta.id}`}
															to={buildLink(
																APP_PATH.COLLECTION_DETAIL.route,
																{ id: relation.object_meta.id }
															)}
														>
															{relation.object_meta.title}
														</Link>
													))}
												</p>
											)}

											{hasParentBundles && (
												<p className="c-body-1">
													{`${t(
														'collection/views/collection-detail___deze-collectie-is-deel-van-een-map'
													)} `}
													{publishedBundles.map((bundle, index) => (
														<>
															{index !== 0 &&
																!!publishedBundles.length &&
																', '}
															<Link
																to={buildLink(
																	APP_PATH.BUNDLE_DETAIL.route,
																	{
																		id: bundle.id,
																	}
																)}
															>
																{bundle.title}
															</Link>
														</>
													))}
												</p>
											)}
										</Spacer>
									</Column>
								)}
							</Grid>
							{renderRelatedItems(relatedCollections, defaultRenderDetailLink)}
						</Container>
					</Container>
				</div>
				{!showLoginPopup && (
					<>
						{!!collection && !!user && (
							<PublishCollectionModal
								collection={collection}
								isOpen={isPublishModalOpen}
								onClose={(newCollection: Avo.Collection.Collection | undefined) => {
									setIsPublishModalOpen(false);

									if (newCollection) {
										setCollectionInfo((oldCollectionInfo) => ({
											showLoginPopup:
												oldCollectionInfo?.showLoginPopup || false,
											permissions: oldCollectionInfo?.permissions || {},
											collection: newCollection || null,
										}));
									}
								}}
								history={history}
								location={location}
								match={match}
								user={user}
							/>
						)}
						{collectionId !== undefined && !!user && (
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
						<DeleteCollectionModal
							collectionId={(collection as Avo.Collection.Collection).id}
							isOpen={isDeleteModalOpen}
							onClose={() => setIsDeleteModalOpen(false)}
							deleteObjectCallback={onDeleteCollection}
						/>
						<ShareThroughEmailModal
							modalTitle={t(
								'collection/views/collection-detail___deel-deze-collectie'
							)}
							type="collection"
							emailLinkHref={window.location.href}
							emailLinkTitle={(collection as Avo.Collection.Collection).title}
							isOpen={isShareThroughEmailModalOpen}
							onClose={() => setIsShareThroughEmailModalOpen(false)}
						/>
						{!!collection_fragments && collection && (
							<AutoplayCollectionModal
								isOpen={isAutoplayCollectionModalOpen}
								onClose={() => setIsAutoplayCollectionModalOpen(false)}
								collectionFragments={collection_fragments}
							/>
						)}
						{!!collection && (
							<QuickLaneModal
								modalTitle={t(
									'collection/views/collection-detail___delen-met-leerlingen'
								)}
								isOpen={isQuickLaneModalOpen}
								content={collection}
								content_label="COLLECTIE"
								onClose={() => {
									setIsQuickLaneModalOpen(false);
								}}
								onUpdate={(newCollection) => {
									if ((collection as CollectionSchema).collection_fragments) {
										setCollectionInfo((oldCollectionInfo) => ({
											showLoginPopup:
												oldCollectionInfo?.showLoginPopup || false,
											permissions: oldCollectionInfo?.permissions || {},
											collection:
												(newCollection as Avo.Collection.Collection) ||
												null,
										}));
									}
								}}
							/>
						)}
						{!!collection && !!user && (
							<>
								<CreateAssignmentModal
									isOpen={isCreateAssignmentModalOpen}
									onClose={() => setIsCreateAssignmentModalOpen(false)}
									createAssignmentCallback={onCreateAssignment}
								/>
								<ImportToAssignmentModal
									user={user}
									isOpen={isImportToAssignmentModalOpen}
									onClose={() => setIsImportToAssignmentModalOpen(false)}
									importToAssignmentCallback={onImportToAssignment}
									showToggle={true}
									translations={{
										title: t(
											'assignment/modals/import-to-assignment-modal___importeer-naar-bestaande-opdracht'
										),
										primaryButton: t(
											'assignment/modals/import-to-assignment-modal___importeer'
										),
										secondaryButton: t(
											'assignment/modals/import-to-assignment-modal___annuleer'
										),
									}}
								/>
								<ConfirmImportToAssignmentWithResponsesModal
									isOpen={isConfirmImportToAssignmentWithResponsesModalOpen}
									onClose={() =>
										setIsConfirmImportToAssignmentWithResponsesModalOpen(false)
									}
									confirmCallback={onConfirmImportAssignment}
									translations={{
										title: t(
											'assignment/modals/confirm-import-to-assignment-with-responses-modal___collectie-importeren'
										),
										warningCallout: t(
											'assignment/modals/confirm-import-to-assignment-with-responses-modal___opgelet'
										),
										warningMessage: t(
											'assignment/modals/confirm-import-to-assignment-with-responses-modal___leerlingen-hebben-deze-opdracht-reeds-bekeken'
										),
										warningBody: t(
											'assignment/modals/confirm-import-to-assignment-with-responses-modal___ben-je-zeker-dat-je-de-collectie-wil-importeren-tot-deze-opdracht'
										),
										primaryButton: t(
											'assignment/modals/create-assignment-modal___importeer'
										),
										secondaryButton: t(
											'assignment/modals/create-assignment-modal___annuleer'
										),
									}}
								/>
							</>
						)}
					</>
				)}
				{showLoginPopup && <RegisterOrLogin />}
			</>
		);
	};

	return (
		<>
			<LoadingErrorLoadedComponent
				render={renderCollection}
				dataObject={permissions}
				loadingInfo={loadingInfo}
			/>
		</>
	);
};

export default compose(
	withRouter,
	withUser
)(CollectionDetail) as FunctionComponent<CollectionDetailProps>;
