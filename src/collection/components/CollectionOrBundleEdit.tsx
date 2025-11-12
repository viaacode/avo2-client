import {
	Button,
	ButtonToolbar,
	Container,
	convertToHtml,
	Header,
	HeaderBottomRowLeft,
	HeaderMiddleRowRight,
	IconName,
	Navbar,
	type TabProps,
	Tabs,
} from '@viaa/avo2-components';
import {Avo, PermissionName} from '@viaa/avo2-types';
import {useAtomValue} from 'jotai';
import {cloneDeep, isNil, noop} from 'es-toolkit';
import {isEmpty, set} from 'es-toolkit/compat';
import React, {type FC, type ReactNode, type ReactText, useCallback, useEffect, useMemo, useReducer, useState,} from 'react';
import {Helmet} from 'react-helmet';
import {matchPath, Navigate, useNavigate, useParams} from 'react-router';

import {ItemsService} from '../../admin/items/items.service.js';
import {reorderBlockPositions, setBlockPositionToIndex} from '../../assignment/assignment.helper.js';
import {AssignmentService} from '../../assignment/assignment.service.js';
import {commonUserAtom} from '../../authentication/authentication.store.js';
import {PermissionService} from '../../authentication/helpers/permission-service.js';
import {redirectToClientPage} from '../../authentication/helpers/redirects/redirect-to-client-page.js';
import {APP_PATH, GENERATE_SITE_TITLE} from '../../constants.js';
import {ErrorNoAccess} from '../../error/components/ErrorNoAccess.js';
import {ErrorView} from '../../error/views/ErrorView.js';
import {OrderDirection} from '../../search/search.const.js';
import {BeforeUnloadPrompt} from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt.js';
import {DraggableBlock} from '../../shared/components/DraggableBlock/DraggableBlock.js';
import {DraggableListModal} from '../../shared/components/DraggableList/DraggableListModal.js';
import {HeaderOwnerAndContributors} from '../../shared/components/HeaderOwnerAndContributors/HeaderOwnerAndContributors.js';
import {InActivityWarningModal} from '../../shared/components/InActivityWarningModal/InActivityWarningModal.js';
import {InputModal} from '../../shared/components/InputModal/InputModal.js';
import {InteractiveTour} from '../../shared/components/InteractiveTour/InteractiveTour.js';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent.js';
import {MoreOptionsDropdownWrapper} from '../../shared/components/MoreOptionsDropdownWrapper/MoreOptionsDropdownWrapper.js';
import {ShareDropdown} from '../../shared/components/ShareDropdown/ShareDropdown.js';
import {ShareModal} from '../../shared/components/ShareModal/ShareModal.js';
import {ContributorInfoRight} from '../../shared/components/ShareWithColleagues/ShareWithColleagues.types.js';
import {StickySaveBar} from '../../shared/components/StickySaveBar/StickySaveBar.js';
import {getMoreOptionsLabel, ROUTE_PARTS} from '../../shared/constants/index.js';
import {buildLink} from '../../shared/helpers/build-link.js';
import {getContributorType, transformContributorsToSimpleContributors,} from '../../shared/helpers/contributors.js';
import {convertRteToString} from '../../shared/helpers/convert-rte-to-string.js';
import {CustomError} from '../../shared/helpers/custom-error.js';
import {createDropdownMenuItem} from '../../shared/helpers/dropdown.js';
import {navigate} from '../../shared/helpers/link.js';
import {isMobileWidth} from '../../shared/helpers/media-query.js';
import {renderMobileDesktop} from '../../shared/helpers/renderMobileDesktop.js';
import {useWarningBeforeUnload} from '../../shared/hooks/useWarningBeforeUnload.js';
import {BookmarksViewsPlaysService} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.js';
import {
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.const.js';
import {type BookmarkViewPlayCounts} from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types.js';
import {trackEvents} from '../../shared/services/event-logging-service.js';
import {ToastService} from '../../shared/services/toast-service.js';
import {COLLECTIONS_ID} from '../../workspace/workspace.const.js';
import {getFragmentsFromCollection} from '../collection.helpers.js';
import {CollectionService} from '../collection.service.js';
import {
	COLLECTION_OR_BUNDLE_TO_CONTENT_TYPE_ENGLISH,
	CollectionCreateUpdateTab,
	CollectionMenuAction,
	CollectionOrBundle,
	ContentTypeNumber,
} from '../collection.types.js';
import {onAddContributor, onDeleteContributor, onEditContributor,} from '../helpers/collection-share-with-collegue-handlers.js';
import {deleteCollection, deleteSelfFromCollection} from '../helpers/delete-collection.js';
import {BundleSortProp, useGetCollectionsOrBundlesContainingFragment,} from '../hooks/useGetCollectionsOrBundlesContainingFragment.js';

import {GET_REORDER_TYPE_TO_BUTTON_LABEL, REORDER_TYPE_TO_FRAGMENT_TYPE,} from './CollectionOrBundleEdit.consts.js';
import {
	type CollectionAction,
	type CollectionOrBundleEditProps,
	type CollectionState,
	ReorderType,
} from './CollectionOrBundleEdit.types.js';
import {CollectionOrBundleEditActualisation} from './CollectionOrBundleEditActualisation.js';
import {CollectionOrBundleEditAdmin} from './CollectionOrBundleEditAdmin.js';
import {CollectionOrBundleEditContent} from './CollectionOrBundleEditContent.js';
import {COLLECTION_SAVE_DELAY} from './CollectionOrBundleEditContent.consts.js';
import {CollectionOrBundleEditMarcom} from './CollectionOrBundleEditMarcom.js';
import {CollectionOrBundleEditMetaData} from './CollectionOrBundleEditMetaData.js';
import {CollectionOrBundleEditQualityCheck} from './CollectionOrBundleEditQualityCheck.js';
import {CollectionOrBundleTitle} from './CollectionOrBundleTitle.js';
import {DeleteCollectionModal} from './modals/DeleteCollectionModal.js';
import {DeleteMyselfFromCollectionContributorsConfirmModal} from './modals/DeleteContributorFromCollectionModal.js';
import {PublishCollectionModal} from './modals/PublishCollectionModal.js';
import {tText} from '../../shared/helpers/translate-text.js';
import {tHtml} from '../../shared/helpers/translate-html.js';

import './CollectionOrBundleEdit.scss';

export const CollectionOrBundleEdit: FC<CollectionOrBundleEditProps> = ({ type }) => {
	const navigateFunc = useNavigate();

	const { id: collectionId, tabId } = useParams<{
		id: string;
		tabId: CollectionCreateUpdateTab;
	}>();

	const commonUser = useAtomValue(commonUserAtom);
	// State
	const [currentTab, setCurrentTab] = useState<CollectionCreateUpdateTab | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isSavingCollection, setIsSavingCollection] = useState<boolean>(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isDeleteContributorModalOpen, setIsDeleteContributorModalOpen] =
		useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isEnterItemIdModalOpen, setEnterItemIdModalOpen] = useState<boolean>(false);
	const [isEnterAssignmentIdModalOpen, setEnterAssignmentIdModalOpen] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [permissions, setPermissions] = useState<
		Partial<{
			canView: boolean;
			canEdit: boolean;
			canDelete: boolean;
			canCreate: boolean;
			canViewItems: boolean;
			canPublish: boolean;
		}>
	>({});
	const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);
	useWarningBeforeUnload({
		when: unsavedChanges,
	});
	const [shouldDelaySave, setShouldDelaySave] = useState(false);
	const [contributors, setContributors] = useState<Avo.Collection.Contributor[]>();
	const [isForcedExit, setIsForcedExit] = useState<boolean>(false);

	// Computed values

	const isCollection = type === 'collection';
	const isAdmin = isCollection
		? commonUser?.permissions?.includes(PermissionName.EDIT_ANY_COLLECTIONS)
		: commonUser?.permissions?.includes(PermissionName.EDIT_ANY_BUNDLES);
	const noRightsError = useMemo(
		() =>
			({
				state: 'error',
				message: isCollection
					? tText(
							'collection/components/collection-or-bundle-edit___je-hebt-geen-rechten-om-deze-collectie-te-bewerken'
					  )
					: tText(
							'collection/components/collection-or-bundle-edit___je-hebt-geen-rechten-om-deze-bundel-te-bewerken'
					  ),
				icon: IconName.alertTriangle,
			}) as LoadingInfo,
		[isCollection, tText]
	);

	const releaseCollectionEditStatus = useCallback(async () => {
		try {
			if (!collectionId) {
				return;
			}
			await CollectionService.releaseCollectionEditStatus(collectionId);
		} catch (err) {
			if ((err as CustomError)?.innerException?.additionalInfo?.statusCode !== 409) {
				ToastService.danger(
					tHtml(
						'collection/components/collection-or-bundle-edit___er-liep-iets-fout-met-het-updaten-van-de-collectie-bewerk-status'
					)
				);
			}
		}
	}, [collectionId]);

	const updateCollectionEditor = useCallback(async () => {
		try {
			if (!collectionId) {
				return;
			}
			await CollectionService.updateCollectionEditor(collectionId);
		} catch (err) {
			redirectToClientPage(
				buildLink(APP_PATH.COLLECTION_DETAIL.route, { id: collectionId }),
				navigateFunc
			);

			if ((err as CustomError).innerException?.additionalInfo?.statusCode === 409) {
				await releaseCollectionEditStatus();
				ToastService.danger(
					tHtml(
						'collection/components/collection-or-bundle-edit___iemand-is-deze-collectie-reeds-aan-het-bewerken'
					)
				);
			} else if ((err as CustomError).innerException?.additionalInfo?.statusCode === 401) {
				return; // User has no rights to edit the collection
			} else {
				ToastService.danger(
					tHtml(
						'collection/components/collection-or-bundle-edit___verbinding-met-bewerk-server-verloren'
					)
				);
			}
		}
	}, [collectionId, navigateFunc, releaseCollectionEditStatus]);

	const updateCollectionEditorWithLoading = useCallback(async () => {
		if (!isCollection) {
			return;
		}

		setLoadingInfo({ state: 'loading' });
		await updateCollectionEditor();
	}, [isCollection, updateCollectionEditor]);

	useEffect(() => {
		updateCollectionEditorWithLoading().then(noop);
	}, [updateCollectionEditorWithLoading]);

	const createInitialCollection = (collection: Avo.Collection.Collection | null) => {
		if (!collection) {
			return collection;
		}

		const mapDescription = (description: string | undefined | null) =>
			description ? convertToHtml(description) : undefined;

		return {
			...collection,
			collection_fragments: collection.collection_fragments
				? collection.collection_fragments.map((item) => {
						const item_meta = item.item_meta;

						return {
							...item,
							custom_description: mapDescription(item.custom_description),
							item_meta: item_meta
								? {
										...item.item_meta,
										description: mapDescription(item_meta.description),
								  }
								: item_meta,
						} as Avo.Collection.Fragment;
				  })
				: collection.collection_fragments,
		};
	};

	const updateHasUnsavedChanges = (
		initialCollection: Avo.Collection.Collection | null,
		currentCollection: Avo.Collection.Collection | null
	): void => {
		const hasChanges =
			JSON.stringify(convertRteToString(initialCollection)) !==
			JSON.stringify(convertRteToString(currentCollection));

		if (!unsavedChanges) {
			setUnsavedChanges(hasChanges);
		}
	};

	const fetchContributors = useCallback(async (): Promise<void> => {
		if (!collectionId) {
			return;
		}
		const response = await CollectionService.fetchContributorsByCollectionId(collectionId);

		setContributors(response as Avo.Collection.Contributor[]);
	}, [collectionId]);

	useEffect(() => {
		fetchContributors();
	}, [fetchContributors]);

	// Main collection reducer
	function currentCollectionReducer(
		collectionState: CollectionState,
		action: CollectionAction
	): CollectionState {
		if (action.type === 'UPDATE_COLLECTION') {
			setUnsavedChanges(false);

			const newCollection = action.newCollection;

			if (newCollection && newCollection.type_id === ContentTypeNumber.bundle) {
				// Ensure collection fragments come first and then the assignment fragments inside the bundle fragments list
				const orderedBlocks = reorderBlockPositions(
					newCollection?.collection_fragments || []
				) as unknown as Avo.Collection.Fragment[];
				newCollection.collection_fragments = setBlockPositionToIndex([
					...orderedBlocks.filter(
						(fragment) => fragment.type === Avo.Core.BlockItemType.COLLECTION
					),
					...orderedBlocks.filter(
						(fragment) => fragment.type === Avo.Core.BlockItemType.ASSIGNMENT
					),
				]) as unknown as Avo.Collection.Fragment[];
			}

			return {
				currentCollection: action.newCollection,
				initialCollection: createInitialCollection(cloneDeep(action.newCollection)),
			};
		}

		if (action.type === 'RESET_COLLECTION') {
			const newCollection = collectionState.initialCollection;
			setUnsavedChanges(false);

			if (newCollection && newCollection.type_id === ContentTypeNumber.bundle) {
				// Ensure collection fragments come first and then the assignment fragments inside the bundle fragments list
				const orderedBlocks = reorderBlockPositions(
					newCollection?.collection_fragments || []
				) as unknown as Avo.Collection.Fragment[];
				newCollection.collection_fragments = setBlockPositionToIndex([
					...orderedBlocks.filter(
						(fragment) => fragment.type === Avo.Core.BlockItemType.COLLECTION
					),
					...orderedBlocks.filter(
						(fragment) => fragment.type === Avo.Core.BlockItemType.ASSIGNMENT
					),
				]) as unknown as Avo.Collection.Fragment[];
			}

			return {
				currentCollection: newCollection,
				initialCollection: createInitialCollection(newCollection),
			};
		}

		const newCurrentCollection: Avo.Collection.Collection | null = cloneDeep(
			collectionState.currentCollection
		);
		const newInitialCollection: Avo.Collection.Collection | null = cloneDeep(
			collectionState.initialCollection
		);

		if (!newCurrentCollection) {
			ToastService.danger(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-edit___de-collectie-is-nog-niet-geladen'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-edit___de-bundel-is-nog-niet-geladen'
					  )
			);
			return collectionState;
		}

		switch (action.type) {
			case 'UPDATE_FRAGMENT_PROP':
				newCurrentCollection.collection_fragments[action.index] = {
					...newCurrentCollection.collection_fragments[action.index],
					[action.fragmentProp]: action.fragmentPropValue,
				};
				break;

			case 'SWAP_FRAGMENTS': {
				if (
					!newCurrentCollection.collection_fragments ||
					!newCurrentCollection.collection_fragments.length
				) {
					ToastService.danger(
						isCollection
							? tHtml(
									'collection/components/collection-or-bundle-edit___de-collectie-lijkt-geen-fragmenten-te-bevatten'
							  )
							: tHtml(
									'collection/components/collection-or-bundle-edit___deze-bundel-lijkt-geen-collecties-te-bevatten'
							  )
					);
					return collectionState;
				}

				const fragments = reorderBlockPositions(
					getFragmentsFromCollection(newCurrentCollection)
				);

				const delta = action.direction === 'up' ? -1 : 1;

				// Make the swap
				fragments[action.index].position = fragments[action.index].position + delta;
				fragments[action.index + delta].position =
					fragments[action.index + delta].position - delta;

				newCurrentCollection.collection_fragments = reorderBlockPositions(
					fragments
				) as Avo.Collection.Fragment[];
				break;
			}

			case 'INSERT_FRAGMENT': {
				const fragments = getFragmentsFromCollection(newCurrentCollection);
				action.fragment.position = action.index;
				fragments.splice(action.index, 0, action.fragment);
				newCurrentCollection.collection_fragments = setBlockPositionToIndex(
					fragments
				) as Avo.Collection.Fragment[];
				break;
			}

			case 'DELETE_FRAGMENT': {
				const fragments = getFragmentsFromCollection(newCurrentCollection);
				fragments.splice(action.index, 1);
				newCurrentCollection.collection_fragments = reorderBlockPositions(
					fragments
				) as Avo.Collection.Fragment[];
				break;
			}

			case 'UPDATE_COLLECTION_PROP':
				set(newCurrentCollection, action.collectionProp, action.collectionPropValue);
				if (action.updateInitialCollection && newInitialCollection) {
					set(newInitialCollection, action.collectionProp, action.collectionPropValue);
				}
				break;
		}

		updateHasUnsavedChanges(newInitialCollection, newCurrentCollection);

		return {
			currentCollection: newCurrentCollection,
			initialCollection: createInitialCollection(newInitialCollection),
		};
	}

	const [collectionState, changeCollectionState] = useReducer<
		React.Reducer<CollectionState, CollectionAction>
	>(currentCollectionReducer, {
		currentCollection: null,
		initialCollection: null,
	});
	const isPublic = collectionState.currentCollection?.is_public || false;
	const isOwner =
		!!collectionState.currentCollection?.owner_profile_id &&
		collectionState.currentCollection?.owner_profile_id === commonUser?.profileId;
	const isContributor = !!(collectionState.currentCollection?.contributors || []).find(
		(contributor) =>
			!!contributor.profile_id && contributor.profile_id === commonUser?.profileId
	);
	const shouldDeleteSelfFromCollection = isContributor && !permissions.canDelete;

	const { data: bundlesContainingCollection } = useGetCollectionsOrBundlesContainingFragment(
		collectionId as string,
		BundleSortProp.title,
		Avo.Search.OrderDirection.ASC,
		{ enabled: !!collectionId && !!collectionState.currentCollection }
	);

	useEffect(() => {
		if (collectionState.currentCollection && contributors && isCollection) {
			const userContributorRole = getContributorType(
				commonUser?.profileId,
				collectionState.currentCollection as Avo.Collection.Collection,
				contributors
			);

			if (userContributorRole === 'VIEWER' && !isAdmin) {
				setLoadingInfo(noRightsError);
			}
		}
	}, [
		commonUser,
		collectionState.currentCollection,
		contributors,
		isCollection,
		isAdmin,
		noRightsError,
	]);

	const [draggableListType, setDraggableListType] = useState<ReorderType | null>(null);

	const checkPermissionsAndGetCollection = useCallback(async (): Promise<void> => {
		try {
			if (!collectionId) {
				return;
			}
			const permissionObj = await PermissionService.checkPermissions(
				{
					canEdit: [
						{
							name: isCollection
								? PermissionName.EDIT_OWN_COLLECTIONS
								: PermissionName.EDIT_OWN_BUNDLES,
							obj: collectionId,
						},
						{
							name: isCollection
								? PermissionName.EDIT_ANY_COLLECTIONS
								: PermissionName.EDIT_ANY_BUNDLES,
						},
					],
					canDelete: [
						{
							name: isCollection
								? PermissionName.DELETE_OWN_COLLECTIONS
								: PermissionName.DELETE_OWN_BUNDLES,
							obj: collectionId,
						},
						{
							name: isCollection
								? PermissionName.DELETE_ANY_COLLECTIONS
								: PermissionName.DELETE_ANY_BUNDLES,
						},
					],
					canCreate: [
						{
							name: isCollection
								? PermissionName.CREATE_COLLECTIONS
								: PermissionName.CREATE_BUNDLES,
						},
					],
					canViewItems: [{ name: PermissionName.VIEW_ANY_PUBLISHED_ITEMS }],
					canPublish: [
						{
							name: isCollection
								? PermissionName.PUBLISH_OWN_COLLECTIONS
								: PermissionName.PUBLISH_OWN_BUNDLES,
							obj: collectionId,
						},
						{
							name: isCollection
								? PermissionName.PUBLISH_ANY_COLLECTIONS
								: PermissionName.PUBLISH_ANY_BUNDLES,
						},
					],
				},
				commonUser
			);

			if (!permissionObj.canEdit && !isAdmin) {
				setLoadingInfo(noRightsError);
				return;
			}

			const collectionObj = await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
				collectionId,
				type,
				undefined
			);

			if (!collectionObj) {
				setLoadingInfo({
					state: 'error',
					message: isCollection
						? tText(
								'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden'
						  )
						: tText('bundle/views/bundle-detail___de-bundel-kon-niet-worden-gevonden'),
					icon: IconName.search,
				});
				return;
			}

			if (contributors?.length) {
				const userContributorRole = getContributorType(
					commonUser?.profileId,
					collectionObj as Avo.Collection.Collection,
					contributors
				);

				if (userContributorRole === 'VIEWER' && !isAdmin) {
					setLoadingInfo(noRightsError);
					return;
				}
			}

			try {
				setBookmarkViewPlayCounts(
					await BookmarksViewsPlaysService.getCollectionCounts(
						collectionObj.id,
						commonUser
					)
				);
			} catch (err) {
				console.error(
					new CustomError('Failed to get getCollectionCounts', err, {
						uuid: collectionObj.id,
					})
				);
				ToastService.danger(
					tHtml(
						'collection/views/collection-detail___het-ophalen-van-het-aantal-keer-bekeken-gebookmarked-is-mislukt'
					)
				);
			}

			// check quality check approved_at date
			if (
				!collectionObj?.management_language_check?.[0]?.qc_status ||
				!collectionObj?.management_quality_check?.[0]?.qc_status
			) {
				collectionObj.management_final_check = collectionObj.management_final_check || [];
				collectionObj.management_final_check[0] =
					collectionObj.management_final_check[0] || {};
				collectionObj.management_final_check[0].created_at = '';
			}

			setPermissions(permissionObj);
			changeCollectionState({
				type: 'UPDATE_COLLECTION',
				newCollection: createInitialCollection(collectionObj),
			});
		} catch (err) {
			if ((err as CustomError)?.innerException?.statusCode === 403) {
				// If forbidden to access, show no acces error
				setLoadingInfo({
					state: 'forbidden',
				});
				return;
			}

			console.error(
				new CustomError(
					`Failed to check permissions or get ${type} from the database`,
					err,
					{
						collectionId,
					}
				)
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? tText(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-tijdens-het-ophalen-van-de-collectie'
					  )
					: tText(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-tijdens-het-ophalen-van-de-bundel'
					  ),
				icon: IconName.alertTriangle,
			});
		}
	}, [isCollection, collectionId, commonUser, isAdmin, type, contributors, noRightsError]);

	useEffect(() => {
		checkPermissionsAndGetCollection().then(noop);
	}, [checkPermissionsAndGetCollection]);

	useEffect(() => {
		if (
			collectionState.currentCollection &&
			collectionState.initialCollection &&
			!isEmpty(permissions)
		) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [collectionState.currentCollection, collectionState.initialCollection, permissions]);

	// react to route changes by navigating back wih the browser history back button
	useEffect(() => {
		setCurrentTab(tabId || CollectionCreateUpdateTab.CONTENT);
	}, [tabId]);

	// Change page on tab selection
	const selectTab = (selectedTab: ReactText) => {
		const tabName = String(selectedTab) as CollectionCreateUpdateTab;
		navigate(
			navigateFunc,
			isCollection ? APP_PATH.COLLECTION_EDIT_TAB.route : APP_PATH.BUNDLE_EDIT_TAB.route,
			{ id: collectionId, tabId: tabName }
		);
		setCurrentTab(tabName);
	};

	const getCollectionEditTabs = (isCollection: boolean): TabProps[] => {
		const showAdminTab: boolean = PermissionService.hasAtLeastOnePerm(
			commonUser,
			isCollection
				? [
						PermissionName.EDIT_COLLECTION_QUALITY_LABELS,
						PermissionName.EDIT_COLLECTION_AUTHOR,
						PermissionName.EDIT_COLLECTION_EDITORIAL_STATUS,
				  ]
				: [
						PermissionName.EDIT_BUNDLE_QUALITY_LABELS,
						PermissionName.EDIT_BUNDLE_AUTHOR,
						PermissionName.EDIT_BUNDLE_EDITORIAL_STATUS,
				  ]
		);
		const showEditorialTabs = !!(
			(isCollection &&
				collectionState?.currentCollection?.is_managed &&
				PermissionService.hasPerm(
					commonUser,
					PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS
				)) ||
			(!isCollection &&
				collectionState?.currentCollection?.is_managed &&
				PermissionService.hasPerm(
					commonUser,
					PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS
				))
		);
		return [
			{
				id: CollectionCreateUpdateTab.CONTENT,
				label: tText('collection/collection___inhoud'),
				icon: IconName.collection,
			},
			{
				id: CollectionCreateUpdateTab.PUBLISH,
				label: tText('collection/collection___publicatiedetails'),
				icon: IconName.fileText,
			},
			...(showAdminTab
				? [
						{
							id: CollectionCreateUpdateTab.ADMIN,
							label: tText('collection/collection___beheer'),
							icon: IconName.settings,
						} as TabProps,
				  ]
				: []),
			...(showEditorialTabs
				? [
						{
							id: CollectionCreateUpdateTab.ACTUALISATION,
							label: tText(
								'collection/components/collection-or-bundle-edit___actualisatie'
							),
							icon: IconName.checkCircle,
						} as TabProps,
						{
							id: CollectionCreateUpdateTab.QUALITY_CHECK,
							label: tText(
								'collection/components/collection-or-bundle-edit___kwaliteitscontrole'
							),
							icon: IconName.checkSquare,
						} as TabProps,
						{
							id: CollectionCreateUpdateTab.MARCOM,
							label: tText(
								'collection/components/collection-or-bundle-edit___marcom'
							),
							icon: IconName.send,
						} as TabProps,
				  ]
				: []),
		];
	};

	// Add active state to current tab
	const tabs: TabProps[] = getCollectionEditTabs(isCollection).map((tab: TabProps) => ({
		...tab,
		active: currentTab === tab.id,
	}));

	const isCollectionValid = (): ReactNode | null => {
		if (
			(collectionState.currentCollection?.is_managed || true) &&
			(!!collectionState.currentCollection?.management_language_check?.[0] ||
				!!collectionState.currentCollection?.management_quality_check?.[0]) &&
			!collectionState.currentCollection?.management_language_check?.[0]?.assignee_profile_id
		) {
			navigate(
				navigateFunc,
				buildLink(
					isCollection
						? APP_PATH.COLLECTION_EDIT_TAB.route
						: APP_PATH.BUNDLE_EDIT_TAB.route,
					{
						id: collectionId,
						tabId: ROUTE_PARTS.qualitycheck,
					}
				)
			);
			return isCollection
				? tHtml(
						'collection/components/collection-or-bundle-edit___een-collectie-met-redactie-moet-een-kwaliteitscontrole-verantwoordelijke-hebben'
				  )
				: tHtml(
						'collection/components/collection-or-bundle-edit___een-bundel-met-redactie-moet-een-kwaliteitscontrole-verantwoordelijke-hebben'
				  );
		}
		return null;
	};

	const updateCollection = async (checkValidation = true) => {
		if (!collectionId) {
			return;
		}
		if (isNil(collectionState.currentCollection)) {
			console.error('Current collection state is nil');
			ToastService.danger(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-edit___het-opslaan-van-de-collectie-is-mislukt'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-edit___het-opslaan-van-de-bundel-is-mislukt'
					  )
			);
			return null;
		}

		// Deal with the owner changing
		if (
			collectionState.initialCollection?.owner_profile_id !==
			collectionState.currentCollection.owner_profile_id
		) {
			await CollectionService.transferCollectionOwnerShip(
				collectionId,
				collectionState.currentCollection.owner_profile_id
			);
		}

		// Save the other collection fields including the new owner id
		return await CollectionService.updateCollection(
			collectionState.initialCollection,
			collectionState.currentCollection,
			commonUser,
			checkValidation,
			isCollection
		);
	};

	const cancelSaveBar = () => {
		changeCollectionState({ type: 'RESET_COLLECTION' });
		setUnsavedChanges(false);
	};

	// Listeners
	const onSaveCollection = useCallback(async () => {
		setIsSavingCollection(true);
		try {
			const validationError: ReactNode | null = isCollectionValid();
			if (validationError) {
				ToastService.danger(validationError);
				setIsSavingCollection(false);
				return;
			}

			if (collectionState.currentCollection) {
				const newCollection = await updateCollection();

				if (newCollection) {
					await checkPermissionsAndGetCollection();
					await fetchContributors();

					setUnsavedChanges(false);

					ToastService.success(
						isCollection
							? tHtml(
									'collection/components/collection-or-bundle-edit___collectie-opgeslagen'
							  )
							: tHtml(
									'collection/components/collection-or-bundle-edit___bundle-opgeslagen'
							  )
					);

					const contributorType = (
						isAdmin
							? 'ADMIN'
							: getContributorType(
									commonUser?.profileId,
									newCollection,
									contributors || []
							  )
					).toLowerCase();
					trackEvents(
						{
							object: String(newCollection.id),
							object_type: type,
							action: 'edit',
							resource: {
								is_public: newCollection.is_public,
								role: contributorType,
							},
						},
						commonUser
					);
				}
			}
		} catch (err) {
			console.error('Failed to save collection/bundle to the database', err);
			ToastService.danger(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-edit___het-opslaan-van-de-collectie-is-mislukt'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-edit___het-opslaan-van-de-bundel-is-mislukt'
					  )
			);
		}
		setIsSavingCollection(false);
	}, [
		checkPermissionsAndGetCollection,
		collectionState.currentCollection,
		commonUser,
		contributors,
		fetchContributors,
		isAdmin,
		isCollection,
		isCollectionValid,
		type,
		updateCollection,
	]);

	const onClickDelete = () => {
		setIsOptionsMenuOpen(false);
		setIsDeleteModalOpen(true);
	};

	const handleDeleteCollection = async () => {
		if (!collectionId) {
			return;
		}
		await deleteCollection(
			collectionId,
			commonUser,
			isCollection,
			async () => await CollectionService.deleteCollectionOrBundle(collectionId),
			() => navigate(navigateFunc, APP_PATH.WORKSPACE_TAB.route, { tabId: COLLECTIONS_ID })
		);
	};

	const handleDeleteSelfFromCollection = async () => {
		await deleteSelfFromCollection(collectionId, commonUser, () =>
			navigate(navigateFunc, APP_PATH.WORKSPACE_TAB.route, { tabId: COLLECTIONS_ID })
		);
	};

	// TODO: DISABLED FEATURE
	// const onPreviewCollection = () => {};

	const executeAction = useCallback(
		async (item: CollectionMenuAction) => {
			setIsOptionsMenuOpen(false);
			switch (item) {
				case CollectionMenuAction.deleteCollection:
					onClickDelete();
					break;

				case CollectionMenuAction.deleteContributor:
					setIsOptionsMenuOpen(false);
					setIsDeleteContributorModalOpen(true);
					break;

				case CollectionMenuAction.save:
					if (!isSavingCollection) {
						await onSaveCollection();
					}
					break;

				case CollectionMenuAction.openPublishModal:
					if (unsavedChanges && !collectionState?.initialCollection?.is_public) {
						ToastService.info(
							tHtml(
								'collection/components/collection-or-bundle-edit___u-moet-uw-wijzigingen-eerst-opslaan'
							)
						);
					} else {
						setIsPublishModalOpen(!isPublishModalOpen);
					}
					break;

				case CollectionMenuAction.redirectToDetail:
					redirectToClientPage(
						buildLink(
							isCollection
								? APP_PATH.COLLECTION_DETAIL.route
								: APP_PATH.BUNDLE_DETAIL.route,
							{
								id: collectionId,
							}
						),
						navigateFunc
					);
					break;

				case CollectionMenuAction.addItemById:
					setEnterItemIdModalOpen(true);
					break;

				case CollectionMenuAction.addAssignmentById:
					setEnterAssignmentIdModalOpen(true);
					break;

				case CollectionMenuAction.share:
					setIsShareModalOpen(true);
					break;

				default:
					return null;
			}
		},
		[
			collectionId,
			collectionState?.initialCollection?.is_public,
			isCollection,
			isPublishModalOpen,
			isSavingCollection,
			navigateFunc,
			onSaveCollection,
			unsavedChanges,
		]
	);

	/**
	 * https://meemoo.atlassian.net/browse/AVO-3370
	 * Delay the save action by 100ms to ensure the  fragment properties are saved
	 * We cannot update the fragment states live in the parent component, because that would also rerender the video players
	 * and that would cause the video players to lose their current time setting
	 */
	useEffect(() => {
		if (shouldDelaySave) {
			executeAction(CollectionMenuAction.save);
			setShouldDelaySave(false);
		}
	}, [collectionState.currentCollection?.collection_fragments, executeAction, shouldDelaySave]);

	const onCloseShareCollectionModal = (collection?: Avo.Collection.Collection) => {
		setIsPublishModalOpen(false);

		// Update initial and current states, so that the 'hasUnsavedChanged' status is correct
		if (collection) {
			changeCollectionState({
				type: 'UPDATE_COLLECTION_PROP',
				collectionProp: 'is_public',
				collectionPropValue: collection.is_public,
				updateInitialCollection: true,
			});
			changeCollectionState({
				type: 'UPDATE_COLLECTION_PROP',
				collectionProp: 'publish_at',
				collectionPropValue: collection.publish_at,
				updateInitialCollection: true,
			});
		}
	};

	const handleAddItemById = async (id: string) => {
		try {
			if (isCollection) {
				// We're adding an item to the collection
				const item = await ItemsService.fetchItemByExternalId(id);
				if (!item) {
					throw new CustomError('Response does not contain an item', null, {
						item,
					});
				}
				const collectionId = collectionState?.currentCollection?.id;
				if (!collectionId) {
					throw new CustomError('Collection id could not be found', null, {
						collectionState,
					});
				}
				const fragment: Partial<Avo.Collection.Fragment> = {
					use_custom_fields: false,
					start_oc: null,
					position: getFragmentsFromCollection(collectionState.currentCollection).length,
					external_id: id,
					end_oc: null,
					custom_title: null,
					custom_description: null,
					collection_uuid: collectionId,
					item_meta: item,
					type: Avo.Core.BlockItemType.ITEM,
				};
				changeCollectionState({
					type: 'INSERT_FRAGMENT',
					fragment: fragment as Avo.Collection.Fragment,
					index: getFragmentsFromCollection(collectionState.currentCollection).length,
				});
				ToastService.success(
					tHtml(
						'collection/components/collection-or-bundle-edit___het-item-is-toegevoegd-aan-de-collectie'
					)
				);
			} else {
				// We're adding a collection to the bundle
				const collection: Avo.Collection.Collection | null =
					await CollectionService.fetchCollectionOrBundleByIdOrInviteToken(
						id,
						CollectionOrBundle.COLLECTION,
						undefined
					);
				if (!collection) {
					ToastService.danger(
						tHtml(
							'collection/components/collection-or-bundle-edit___de-collectie-met-dit-id-kon-niet-worden-gevonden'
						)
					);
					return;
				}
				const bundleId = collectionState?.currentCollection?.id;
				if (!bundleId) {
					throw new CustomError('Bundle id could not be found', null, {
						collectionState,
					});
				}
				const fragment: Partial<Avo.Collection.Fragment> = {
					use_custom_fields: false,
					start_oc: null,
					position: getFragmentsFromCollection(collectionState.currentCollection).length,
					external_id: id,
					end_oc: null,
					custom_title: null,
					custom_description: null,
					collection_uuid: bundleId,
					item_meta: collection,
					type: Avo.Core.BlockItemType.COLLECTION,
					created_at: new Date().toISOString(),
				};
				changeCollectionState({
					type: 'INSERT_FRAGMENT',
					fragment: fragment as Avo.Collection.Fragment,
					index: getFragmentsFromCollection(collectionState.currentCollection).length,
				});
				ToastService.success(
					tHtml(
						'collection/components/collection-or-bundle-edit___de-collectie-is-toegevoegd-aan-de-bundel'
					)
				);
			}
		} catch (err) {
			console.error(
				new CustomError(
					isCollection
						? 'Failed to add item to collection'
						: 'Failed to add collection to bundle',
					err,
					{ id, isCollection }
				)
			);
			ToastService.danger(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-bij-het-toevoegen-van-het-item'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-bij-het-toevoegen-van-de-collectie'
					  )
			);
		}
	};

	const handleAddAssignmentById = async (id: string) => {
		try {
			// We're adding an assignment to the collection
			const assignment = await AssignmentService.fetchAssignmentById(id);
			if (!assignment) {
				throw new CustomError('Response does not contain an item', null, {
					assignment,
				});
			}
			const bundleId = collectionState?.currentCollection?.id;
			if (!bundleId) {
				throw new CustomError('Bundle id could not be found', null, {
					collectionState,
				});
			}
			const fragment: Partial<Avo.Collection.Fragment> = {
				use_custom_fields: false,
				start_oc: null,
				position: getFragmentsFromCollection(collectionState.currentCollection).length,
				external_id: id,
				end_oc: null,
				custom_title: null,
				custom_description: null,
				item_meta: {
					...assignment,
					type_id: ContentTypeNumber.assignment,
				},
				collection_uuid: bundleId,
				type: Avo.Core.BlockItemType.ASSIGNMENT,
			};
			changeCollectionState({
				type: 'INSERT_FRAGMENT',
				fragment: fragment as Avo.Collection.Fragment,
				index: getFragmentsFromCollection(collectionState.currentCollection).length,
			});
			ToastService.success(
				tHtml(
					'collection/components/collection-or-bundle-edit___de-opdracht-is-toegevoegd-aan-de-bundel'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to add assignment to bundle', err, {
					assignmentId: id,
					bundleId: collectionId,
				})
			);
			ToastService.danger(
				tHtml(
					'collection/components/collection-or-bundle-edit___er-ging-iets-mis-bij-het-toevoegen-van-de-opdracht'
				)
			);
		}
	};

	const onForcedExitPage = async () => {
		setIsForcedExit(true);
		try {
			if (!commonUser?.profileId) {
				return;
			}

			await updateCollection(true);

			ToastService.success(
				tHtml(
					'collection/components/collection-or-bundle-edit___je-was-meer-dan-15-minuten-inactief-je-aanpassingen-zijn-opgeslagen'
				),
				{
					autoClose: false,
				}
			);
		} catch (err) {
			ToastService.danger(
				tHtml(
					'collection/components/collection-or-bundle-edit___je-was-meer-dan-15-minuten-inactief-het-opslaan-van-je-aanpassingen-is-mislukt'
				),
				{
					autoClose: false,
				}
			);
		}

		releaseCollectionEditStatus();

		redirectToClientPage(
			buildLink(APP_PATH.COLLECTION_DETAIL.route, {
				id: collectionId,
			}),
			navigateFunc
		);
	};

	const renderTab = () => {
		if (collectionState.currentCollection) {
			switch (currentTab) {
				case CollectionCreateUpdateTab.CONTENT:
					return (
						<CollectionOrBundleEditContent
							type={type}
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							onFocus={() => setUnsavedChanges(true)}
						/>
					);
				case CollectionCreateUpdateTab.PUBLISH:
					return (
						<CollectionOrBundleEditMetaData
							type={type}
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							onFocus={() => setUnsavedChanges(true)}
						/>
					);
				case CollectionCreateUpdateTab.ADMIN:
					return (
						<CollectionOrBundleEditAdmin
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							onFocus={() => setUnsavedChanges(true)}
						/>
					);
				case CollectionCreateUpdateTab.ACTUALISATION:
					return (
						<CollectionOrBundleEditActualisation
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							onFocus={() => setUnsavedChanges(true)}
						/>
					);
				case CollectionCreateUpdateTab.QUALITY_CHECK:
					return (
						<CollectionOrBundleEditQualityCheck
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							onFocus={() => setUnsavedChanges(true)}
						/>
					);
				case CollectionCreateUpdateTab.MARCOM:
					return (
						<CollectionOrBundleEditMarcom
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							onFocus={() => setUnsavedChanges(true)}
						/>
					);
				default:
					return null;
			}
		}
	};

	const canAddItemToCollectionOrBundle = PermissionService.hasPerm(
		commonUser,
		isCollection
			? PermissionName.ADD_ITEM_TO_COLLECTION_BY_PID
			: PermissionName.ADD_COLLECTION_TO_BUNDLE_BY_ID
	);
	const canAddAssignmentToBundle = PermissionService.hasPerm(
		commonUser,
		PermissionName.ADD_ASSIGNMENT_TO_BUNDLE
	);
	const renderHeaderButtons = () => {
		if (!collectionId) {
			return null;
		}
		const COLLECTION_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				collectionId,
				shouldDeleteSelfFromCollection
					? CollectionMenuAction.deleteContributor
					: CollectionMenuAction.deleteCollection,
				shouldDeleteSelfFromCollection
					? tText(
							'collection/components/collection-or-bundle-edit___verwijder-mij-van-deze-collectie'
					  )
					: tText('collection/components/collection-or-bundle-edit___verwijderen'),
				'delete',
				true
			),
			...createDropdownMenuItem(
				collectionId,
				CollectionMenuAction.addItemById,
				isCollection
					? tText('collection/components/collection-or-bundle-edit___voeg-item-toe')
					: tText('collection/components/collection-or-bundle-edit___voeg-collectie-toe'),
				IconName.plus,
				canAddItemToCollectionOrBundle
			),
			...createDropdownMenuItem(
				collectionId,
				CollectionMenuAction.addAssignmentById,
				tText('collection/components/collection-or-bundle-edit___voeg-opdracht-toe'),
				IconName.plus,
				canAddAssignmentToBundle
			),
		];

		const isPublic =
			collectionState.currentCollection && collectionState.currentCollection.is_public;
		let publishButtonTooltip: string;
		if (unsavedChanges && !collectionState?.initialCollection?.is_public) {
			publishButtonTooltip = tText(
				'collection/components/collection-or-bundle-edit___u-moet-uw-wijzigingen-eerst-opslaan'
			);
		} else if (isPublic) {
			if (isCollection) {
				publishButtonTooltip = tText(
					'collection/views/collection-detail___maak-deze-collectie-prive'
				);
			} else {
				publishButtonTooltip = tText('bundle/views/bundle-detail___maak-deze-bundel-prive');
			}
		} else {
			if (isCollection) {
				publishButtonTooltip = tText(
					'collection/views/collection-detail___maak-deze-collectie-openbaar'
				);
			} else {
				publishButtonTooltip = tText(
					'bundle/views/bundle-detail___maak-deze-bundel-openbaar'
				);
			}
		}

		const renderReorderButtons = (): ReactNode[] => {
			const reorderTypes = [];
			if (isCollection) {
				reorderTypes.push(ReorderType.COLLECTION_FRAGMENTS);
			} else {
				const collectionFragments =
					collectionState.currentCollection?.collection_fragments?.filter(
						(fragment) => fragment.type === Avo.Core.BlockItemType.COLLECTION
					) || [];
				const assignmentFragments =
					collectionState.currentCollection?.collection_fragments?.filter(
						(fragment) => fragment.type === Avo.Core.BlockItemType.ASSIGNMENT
					) || [];

				if (collectionFragments.length > 0) {
					reorderTypes.push(ReorderType.BUNDLE_COLLECTION_FRAGMENTS);
				}
				if (assignmentFragments.length > 0) {
					reorderTypes.push(ReorderType.BUNDLE_ASSIGNMENT_FRAGMENTS);
				}
			}
			return reorderTypes.map((reorderType) => {
				return (
					<Button
						key={'button--' + reorderType}
						icon={IconName.shuffle}
						type="secondary"
						title={tText(
							'shared/hooks/use-draggable-list-modal___herorden-de-onderdelen-via-drag-and-drop'
						)}
						label={GET_REORDER_TYPE_TO_BUTTON_LABEL()[reorderType]}
						onClick={() => {
							setDraggableListType(reorderType);
						}}
					/>
				);
			});
		};

		return (
			<ButtonToolbar>
				{permissions.canPublish && (
					<Button
						type="secondary"
						disabled={unsavedChanges && !collectionState?.initialCollection?.is_public}
						title={publishButtonTooltip}
						ariaLabel={publishButtonTooltip}
						icon={isPublic ? IconName.unlock3 : IconName.lock}
						onClick={() => executeAction(CollectionMenuAction.openPublishModal)}
					/>
				)}
				<Button
					type="secondary"
					label={tText('collection/components/collection-or-bundle-edit___bekijk')}
					title={
						isCollection
							? tText(
									'collection/components/collection-or-bundle-edit___bekijk-hoe-de-collectie-er-zal-uit-zien'
							  )
							: tText(
									'collection/components/collection-or-bundle-edit___bekijk-hoe-de-bundel-er-zal-uit-zien'
							  )
					}
					onClick={() => executeAction(CollectionMenuAction.redirectToDetail)}
				/>

				{renderReorderButtons()}

				<MoreOptionsDropdownWrapper
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					label={getMoreOptionsLabel()}
					menuItems={COLLECTION_DROPDOWN_ITEMS}
					onOptionClicked={(optionId) => executeAction(optionId as CollectionMenuAction)}
				/>

				<InteractiveTour showButton />

				{isCollection && (
					<ShareDropdown
						contributors={transformContributorsToSimpleContributors(
							{
								...collectionState.currentCollection?.profile?.user,
								profile: collectionState.currentCollection?.profile,
							} as Avo.User.User,
							contributors as Avo.Collection.Contributor[]
						)}
						onDeleteContributor={(info) =>
							onDeleteContributor(info, collectionId, fetchContributors)
						}
						onEditContributorRights={(user, newRights) =>
							onEditContributor(
								user,
								newRights,
								collectionId,
								fetchContributors,
								checkPermissionsAndGetCollection
							)
						}
						onAddContributor={(info) =>
							onAddContributor(info, collectionId, fetchContributors)
						}
						withPupils={false}
						availableRights={{
							[ContributorInfoRight.CONTRIBUTOR]:
								PermissionName.SHARE_COLLECTION_WITH_CONTRIBUTOR,
							[ContributorInfoRight.VIEWER]:
								PermissionName.SHARE_COLLECTION_WITH_VIEWER,
						}}
						buttonProps={{
							type: 'secondary',
							title: tText(
								'assignment/components/share-dropdown___deel-de-collectie-met-collegas'
							),
							ariaLabel: tText(
								'assignment/components/share-dropdown___deel-de-collectie-met-collegas'
							),
						}}
						isAdmin={
							commonUser?.permissions?.includes(
								PermissionName.EDIT_ANY_COLLECTIONS
							) || false
						}
					/>
				)}
			</ButtonToolbar>
		);
	};

	const renderHeaderButtonsMobile = () => {
		if (!collectionId) {
			return;
		}
		const COLLECTION_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				collectionId,
				CollectionMenuAction.save,
				tText('collection/views/collection-edit___opslaan'),
				IconName.download,
				true
			),
			...createDropdownMenuItem(
				collectionId,
				CollectionMenuAction.openPublishModal,
				isPublic
					? tText('collection/components/collection-or-bundle-edit___maak-prive')
					: tText('collection/components/collection-or-bundle-edit___publiceer'),
				isPublic ? IconName.unlock3 : IconName.lock,
				true
			),
			...createDropdownMenuItem(
				collectionId,
				CollectionMenuAction.share,
				tText('collection/components/collection-or-bundle-edit___delen'),
				IconName.userGroup,
				isCollection
			),
			...createDropdownMenuItem(
				collectionId,
				CollectionMenuAction.redirectToDetail,
				tText('collection/components/collection-or-bundle-edit___sluiten'),
				IconName.close,
				true
			),
			...createDropdownMenuItem(
				collectionId,
				CollectionMenuAction.rename,
				isCollection
					? 'Collectie hernoemen'
					: tText('collection/components/collection-or-bundle-edit___bundel-hernoemen'),
				IconName.folder,
				true
			),
			...createDropdownMenuItem(
				collectionId,
				permissions.canDelete || isOwner
					? CollectionMenuAction.deleteCollection
					: CollectionMenuAction.deleteContributor,
				permissions.canDelete || isOwner
					? tText('collection/components/collection-or-bundle-edit___verwijderen')
					: tText(
							'collection/components/collection-or-bundle-edit___verwijder-mij-van-deze-collectie'
					  ),
				IconName.delete,
				true
			),
		];
		return (
			<ButtonToolbar>
				<MoreOptionsDropdownWrapper
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					label={getMoreOptionsLabel()}
					menuItems={COLLECTION_DROPDOWN_ITEMS}
					onOptionClicked={(menuItemId) =>
						executeAction(menuItemId as CollectionMenuAction)
					}
				/>
			</ButtonToolbar>
		);
	};

	const renderCollectionOrBundleEdit = () => {
		if (loadingInfo.state === 'forbidden') {
			return (
				<ErrorNoAccess
					title={tHtml(
						'collection/components/collection-or-bundle-edit___je-hebt-geen-toegang'
					)}
					message={tHtml(
						'collection/components/collection-or-bundle-edit___je-hebt-geen-toegang-beschrijving'
					)}
				/>
			);
		}

		return (
			<div className="c-collection-or-bundle-edit">
				<Header
					title={
						<CollectionOrBundleTitle
							initialTitle={collectionState.initialCollection?.title}
							title={collectionState.currentCollection?.title}
							onChange={(title) =>
								changeCollectionState({
									type: 'UPDATE_COLLECTION_PROP',
									updateInitialCollection: false,
									collectionProp: 'title',
									collectionPropValue: title,
								})
							}
							maxLength={110}
							onFocus={() => setUnsavedChanges(true)}
						/>
					}
					category={COLLECTION_OR_BUNDLE_TO_CONTENT_TYPE_ENGLISH[type]}
					showMetaData={true}
					bookmarks={String(bookmarkViewPlayCounts.bookmarkCount || 0)}
					views={String(bookmarkViewPlayCounts.viewCount || 0)}
				>
					<HeaderMiddleRowRight>
						{isMobileWidth() && (
							<div className="c-collection-or-bundle-edit__header-buttons--mobile">
								{renderHeaderButtonsMobile()}
							</div>
						)}
						{!isMobileWidth() && (
							<div className="c-collection-or-bundle-edit__header-buttons--desktop">
								{renderHeaderButtons()}
							</div>
						)}
					</HeaderMiddleRowRight>

					{collectionState.currentCollection && (
						<HeaderBottomRowLeft>
							<HeaderOwnerAndContributors
								subject={collectionState.currentCollection}
							/>
						</HeaderBottomRowLeft>
					)}
				</Header>

				<Navbar background="alt" placement="top" autoHeight>
					<Container mode="horizontal">
						<Tabs tabs={tabs} onClick={selectTab} />
					</Container>
				</Navbar>

				<div className="c-sticky-bar__wrapper">
					{renderTab()}

					{/* Must always be the second and last element inside the c-sticky-bar__wrapper */}
					<StickySaveBar
						isVisible={unsavedChanges}
						onSave={() => {
							/**
							 * https://meemoo.atlassian.net/browse/AVO-3370
							 * Delay the save action by 100ms to ensure the  fragment properties are saved
							 * We cannot update the fragment states live in the parent component, because that would also rerender the video players
							 * and that would cause the video players to lose their current time setting
							 */
							setTimeout(() => {
								setShouldDelaySave(true);
							}, COLLECTION_SAVE_DELAY);
						}}
						onCancel={cancelSaveBar}
						isSaving={isSavingCollection}
					/>
				</div>

				{!!collectionState.currentCollection && (
					<PublishCollectionModal
						collection={collectionState.currentCollection}
						parentBundles={bundlesContainingCollection}
						isOpen={isPublishModalOpen}
						onClose={onCloseShareCollectionModal}
					/>
				)}

				{collectionState.currentCollection &&
					!!collectionId &&
					renderMobileDesktop({
						mobile: (
							<ShareModal
								title={tText(
									'collection/components/collection-or-bundle-edit___deel-deze-collectie-met-collegas'
								)}
								isOpen={isShareModalOpen}
								onClose={() => setIsShareModalOpen(false)}
								contributors={transformContributorsToSimpleContributors(
									{
										...collectionState.currentCollection?.profile?.user,
										profile: collectionState.currentCollection?.profile,
									} as Avo.User.User,
									contributors as Avo.Collection.Contributor[]
								)}
								onDeleteContributor={(info) =>
									onDeleteContributor(info, collectionId, fetchContributors)
								}
								onEditContributorRights={(user, newRights) =>
									onEditContributor(
										user,
										newRights,
										collectionId,
										fetchContributors,
										checkPermissionsAndGetCollection
									)
								}
								onAddContributor={(info) =>
									onAddContributor(info, collectionId, fetchContributors)
								}
								withPupils={false}
								availableRights={{
									[ContributorInfoRight.CONTRIBUTOR]:
										PermissionName.SHARE_COLLECTION_WITH_CONTRIBUTOR,
									[ContributorInfoRight.VIEWER]:
										PermissionName.SHARE_COLLECTION_WITH_VIEWER,
								}}
								isAdmin={
									commonUser?.permissions?.includes(
										PermissionName.EDIT_ANY_COLLECTIONS
									) || false
								}
							/>
						),
						desktop: null,
					})}

				<DeleteCollectionModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteCallback={handleDeleteCollection}
					contributorCount={collectionState.currentCollection?.contributors?.length || 0}
					isCollection={isCollection}
				/>
				<DeleteMyselfFromCollectionContributorsConfirmModal
					isOpen={isDeleteContributorModalOpen}
					onClose={() => setIsDeleteContributorModalOpen(false)}
					deleteCallback={handleDeleteSelfFromCollection}
				/>

				<InputModal
					title={
						isCollection
							? tHtml(
									'collection/components/collection-or-bundle-edit___voeg-item-toe-via-pid'
							  )
							: tHtml(
									'collection/components/collection-or-bundle-edit___voeg-collectie-toe-via-id'
							  )
					}
					inputLabel={tText('collection/components/collection-or-bundle-edit___id')}
					inputPlaceholder={
						isCollection
							? tText(
									'collection/components/collection-or-bundle-edit___bijvoorbeeld-zg-6-g-181-x-5-j'
							  )
							: tText(
									'collection/components/collection-or-bundle-edit___bijvoorbeeld-c-8-a-48-b-7-e-d-27-d-4-b-9-a-a-793-9-ba-79-fff-41-df'
							  )
					}
					isOpen={isEnterItemIdModalOpen}
					onClose={() => setEnterItemIdModalOpen(false)}
					inputCallback={handleAddItemById}
				/>

				<InputModal
					title={tHtml(
						'collection/components/collection-or-bundle-edit___voeg-opdracht-toe-via-id'
					)}
					inputLabel={tText(
						'collection/components/collection-or-bundle-edit___opdracht-id'
					)}
					inputPlaceholder={tText(
						'collection/components/collection-or-bundle-edit___bijvoorbeeld-39057-b-95-92-c-9-446-f-944-b-6459-a-6194-d-8-e'
					)}
					isOpen={isEnterAssignmentIdModalOpen}
					onClose={() => setEnterAssignmentIdModalOpen(false)}
					inputCallback={handleAddAssignmentById}
				/>

				{isCollection && (
					<InActivityWarningModal
						onActivity={updateCollectionEditor}
						onExit={releaseCollectionEditStatus}
						warningMessage={tHtml(
							'collection/components/collection-or-bundle-edit___door-inactiviteit-zal-de-collectie-zichzelf-sluiten'
						)}
						currentPath={location.pathname}
						editPath={APP_PATH.COLLECTION_EDIT_TAB.route}
						onForcedExit={onForcedExitPage}
					/>
				)}

				{draggableListType && (
					<DraggableListModal
						items={getFragmentsFromCollection(
							collectionState.currentCollection,
							REORDER_TYPE_TO_FRAGMENT_TYPE[draggableListType]
						)}
						renderItem={(item) => <DraggableBlock block={item} />}
						isOpen={!!draggableListType}
						onClose={(reorderedFragments?: Avo.Collection.Fragment[]) => {
							setDraggableListType(null);
							if (reorderedFragments) {
								const blocks = setBlockPositionToIndex(reorderedFragments);

								switch (draggableListType) {
									case 'COLLECTION_FRAGMENTS':
										changeCollectionState({
											type: 'UPDATE_COLLECTION_PROP',
											updateInitialCollection: false,
											collectionProp: 'collection_fragments',
											collectionPropValue:
												blocks as Avo.Collection.Fragment[],
										});
										break;

									case 'BUNDLE_COLLECTION_FRAGMENTS': {
										const fragmentCollections = blocks as Avo.Collection.Fragment[];
										const fragmentAssignments = getFragmentsFromCollection(
											collectionState.currentCollection,
											Avo.Core.BlockItemType.ASSIGNMENT
										);
										const newFragments = setBlockPositionToIndex([
											...fragmentCollections,
											...fragmentAssignments,
										]) as Avo.Collection.Fragment[];
										changeCollectionState({
											type: 'UPDATE_COLLECTION_PROP',
											updateInitialCollection: false,
											collectionProp: 'collection_fragments', // Collection fragments and assignment fragments are stored in the same array
											collectionPropValue: newFragments,
										});
										break;
									}

									case 'BUNDLE_ASSIGNMENT_FRAGMENTS': {
										const fragmentCollections = getFragmentsFromCollection(
											collectionState.currentCollection,
											Avo.Core.BlockItemType.COLLECTION
										);
										const fragmentAssignments = blocks as Avo.Collection.Fragment[];
										const newFragments = setBlockPositionToIndex([
											...fragmentCollections,
											...fragmentAssignments,
										]) as Avo.Collection.Fragment[];
										changeCollectionState({
											type: 'UPDATE_COLLECTION_PROP',
											updateInitialCollection: false,
											collectionProp: 'collection_fragments', // Collection fragments and assignment fragments are stored in the same array
											collectionPropValue: newFragments,
										});
										break;
									}
								}
							}
						}}
					/>
				)}
				<BeforeUnloadPrompt when={unsavedChanges && !isForcedExit} />
			</div>
		);
	};

	if (matchPath(location.pathname, APP_PATH.BUNDLE_EDIT.route)) {
		return (
			<Navigate
				to={buildLink(APP_PATH.BUNDLE_EDIT_TAB.route, {
					id: collectionId,
					tabId: CollectionCreateUpdateTab.CONTENT,
				})}
			/>
		);
	}

	if (matchPath(location.pathname, APP_PATH.COLLECTION_EDIT.route)) {
		return (
			<Navigate
				to={buildLink(APP_PATH.COLLECTION_EDIT_TAB.route, {
					id: collectionId,
					tabId: CollectionCreateUpdateTab.CONTENT,
				})}
			/>
		);
	}
	if (!collectionId) {
		return (
			<ErrorView
				icon={IconName.search}
				message={'De collectie id kon niet worden gevonden'}
				actionButtons={['home', 'helpdesk']}
			/>
		);
	}
	return (
		<>
			<Helmet>
				<title>
					{GENERATE_SITE_TITLE(
						collectionState?.currentCollection?.title || isCollection
							? tText(
									'collection/components/collection-or-bundle-edit___collectie-bewerken-titel-fallback'
							  )
							: tText(
									'collection/components/collection-or-bundle-edit___bundel-bewerken-titel-fallback'
							  )
					)}
				</title>
				<meta
					name="description"
					content={collectionState?.currentCollection?.description || ''}
				/>
			</Helmet>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={collectionState.currentCollection}
				render={renderCollectionOrBundleEdit}
			/>
		</>
	);
};
