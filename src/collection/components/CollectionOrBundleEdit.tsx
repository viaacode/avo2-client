import {
	Button,
	ButtonToolbar,
	Container,
	Header,
	HeaderAvatar,
	HeaderButtons,
	IconName,
	MoreOptionsDropdown,
	Navbar,
	TabProps,
	Tabs,
} from '@viaa/avo2-components';
import { Avo, PermissionName } from '@viaa/avo2-types';
import { CollectionSchema } from '@viaa/avo2-types/types/collection';
import { cloneDeep, get, isEmpty, omit, set } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from 'react';
import MetaTags from 'react-meta-tags';
import { matchPath, withRouter } from 'react-router';
import { compose } from 'redux';

import { ItemsService } from '../../admin/items/items.service';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import { ErrorNoAccess } from '../../error/components';
import {
	InActivityWarningModal,
	InputModal,
	InteractiveTour,
	LoadingErrorLoadedComponent,
	LoadingInfo,
	ShareDropdown,
} from '../../shared/components';
import { BeforeUnloadPrompt } from '../../shared/components/BeforeUnloadPrompt/BeforeUnloadPrompt';
import { StickySaveBar } from '../../shared/components/StickySaveBar/StickySaveBar';
import { getMoreOptionsLabel } from '../../shared/constants';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	isMobileWidth,
	navigate,
	renderAvatar,
} from '../../shared/helpers';
import {
	getContributorType,
	transformContributorsToSimpleContributors,
} from '../../shared/helpers/contributors';
import { convertRteToString } from '../../shared/helpers/convert-rte-to-string';
import withUser from '../../shared/hocs/withUser';
import { useDraggableListModal } from '../../shared/hooks/use-draggable-list-modal';
import useTranslation from '../../shared/hooks/useTranslation';
import { useWarningBeforeUnload } from '../../shared/hooks/useWarningBeforeUnload';
import {
	BookmarksViewsPlaysService,
	DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS,
} from '../../shared/services/bookmarks-views-plays-service';
import { BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ToastService } from '../../shared/services/toast-service';
import { ValueOf } from '../../shared/types';
import { COLLECTIONS_ID } from '../../workspace/workspace.const';
import { getFragmentsFromCollection, reorderFragments } from '../collection.helpers';
import { CollectionService } from '../collection.service';
import { CollectionCreateUpdateTab } from '../collection.types';
import { CollectionOrBundleTitle, PublishCollectionModal } from '../components';
import {
	onAddContributor,
	onDeleteContributor,
	onEditContributor,
} from '../helpers/collection-share-handlers';

import CollectionOrBundleEditActualisation from './CollectionOrBundleEditActualisation';
import CollectionOrBundleEditAdmin from './CollectionOrBundleEditAdmin';
import CollectionOrBundleEditContent from './CollectionOrBundleEditContent';
import CollectionOrBundleEditMarcom from './CollectionOrBundleEditMarcom';
import CollectionOrBundleEditMetaData from './CollectionOrBundleEditMetaData';
import CollectionOrBundleEditQualityCheck from './CollectionOrBundleEditQualityCheck';
import DeleteCollectionModal from './modals/DeleteCollectionModal';

type FragmentPropUpdateAction = {
	type: 'UPDATE_FRAGMENT_PROP';
	index: number;
	fragmentProp: keyof Avo.Collection.Fragment;
	fragmentPropValue: ValueOf<Avo.Collection.Fragment>;
};

type FragmentSwapAction = {
	type: 'SWAP_FRAGMENTS';
	index: number;
	direction: 'up' | 'down';
};

type FragmentInsertAction = {
	type: 'INSERT_FRAGMENT';
	index: number;
	fragment: Avo.Collection.Fragment;
};

type FragmentDeleteAction = {
	type: 'DELETE_FRAGMENT';
	index: number;
};

type CollectionUpdateAction = {
	type: 'UPDATE_COLLECTION';
	newCollection: Avo.Collection.Collection | null;
};

type CollectionPropUpdateAction = {
	type: 'UPDATE_COLLECTION_PROP';
	collectionProp: keyof Avo.Collection.Collection | string; // nested values are also allowed
	collectionPropValue: ValueOf<Avo.Collection.Collection>;
	updateInitialCollection?: boolean;
};

type CollectionResetAction = {
	type: 'RESET_COLLECTION';
};

export type CollectionAction =
	| FragmentPropUpdateAction
	| FragmentSwapAction
	| FragmentInsertAction
	| FragmentDeleteAction
	| CollectionUpdateAction
	| CollectionPropUpdateAction
	| CollectionResetAction;

interface CollectionState {
	currentCollection: Avo.Collection.Collection | null;
	initialCollection: Avo.Collection.Collection | null;
}

interface CollectionOrBundleEditProps {
	type: 'collection' | 'bundle';
}

const CollectionOrBundleEdit: FunctionComponent<
	CollectionOrBundleEditProps &
		DefaultSecureRouteProps<{ id: string; tabId: CollectionCreateUpdateTab | undefined }>
> = ({ type, history, location, match, user }) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [collectionId] = useState<string>(match.params.id);
	const [currentTab, setCurrentTab] = useState<CollectionCreateUpdateTab | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isSavingCollection, setIsSavingCollection] = useState<boolean>(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isEnterItemIdModalOpen, setEnterItemIdModalOpen] = useState<boolean>(false);
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
	const [contributors, setContributors] = useState<Avo.Collection.Contributor[]>();
	const [isForcedExit, setIsForcedExit] = useState<boolean>(false);

	// Computed values
	const isCollection = type === 'collection';
	const noRightsError = {
		state: 'error',
		message: isCollection
			? tText(
					'collection/components/collection-or-bundle-edit___je-hebt-geen-rechten-om-deze-collectie-te-bewerken'
			  )
			: tText(
					'collection/components/collection-or-bundle-edit___je-hebt-geen-rechten-om-deze-bundel-te-bewerken'
			  ),
		icon: IconName.alertTriangle,
	} as LoadingInfo;

	const updateCollectionEditorWithLoading = useCallback(async () => {
		setLoadingInfo({ state: 'loading' });
		await updateCollectionEditor();
		setLoadingInfo({ state: 'loaded' });
	}, [setLoadingInfo]);

	useEffect(() => {
		updateCollectionEditorWithLoading();
	}, [updateCollectionEditorWithLoading]);

	const updateHasUnsavedChanges = (
		initialCollection: Avo.Collection.Collection | null,
		currentCollection: Avo.Collection.Collection | null
	): void => {
		const hasChanges =
			JSON.stringify(convertRteToString(initialCollection)) !==
			JSON.stringify(convertRteToString(currentCollection));
		setUnsavedChanges(hasChanges);
	};

	const fetchContributors = useCallback(async () => {
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
			updateHasUnsavedChanges(action.newCollection, action.newCollection);

			return {
				currentCollection: action.newCollection,
				initialCollection: cloneDeep(action.newCollection),
			};
		}

		if (action.type === 'RESET_COLLECTION') {
			const initial = collectionState.initialCollection;

			updateHasUnsavedChanges(initial, initial);

			return {
				currentCollection: initial,
				initialCollection: initial,
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

		// TODO: fix lexical declarations
		/* eslint-disable */
		switch (action.type) {
			case 'UPDATE_FRAGMENT_PROP':
				newCurrentCollection.collection_fragments[action.index] = {
					...newCurrentCollection.collection_fragments[action.index],
					[action.fragmentProp]: action.fragmentPropValue,
				};
				break;

			case 'SWAP_FRAGMENTS':
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

				const fragments1 = getFragmentsFromCollection(newCurrentCollection);

				const delta = action.direction === 'up' ? -1 : 1;

				// Make the swap
				const tempFragment = fragments1[action.index];
				fragments1[action.index] = fragments1[action.index + delta];
				fragments1[action.index + delta] = tempFragment;

				newCurrentCollection.collection_fragments = reorderFragments(fragments1);
				break;

			case 'INSERT_FRAGMENT':
				const fragments2 = getFragmentsFromCollection(newCurrentCollection);
				fragments2.splice(action.index, 0, action.fragment);
				newCurrentCollection.collection_fragments = reorderFragments(fragments2);
				break;

			case 'DELETE_FRAGMENT':
				const fragments3 = getFragmentsFromCollection(newCurrentCollection);
				fragments3.splice(action.index, 1);
				newCurrentCollection.collection_fragments = reorderFragments(fragments3);
				break;

			case 'UPDATE_COLLECTION_PROP':
				set(newCurrentCollection, action.collectionProp, action.collectionPropValue);
				if (action.updateInitialCollection && newInitialCollection) {
					set(newInitialCollection, action.collectionProp, action.collectionPropValue);
				}
				break;
		}
		/* eslint-enable */

		updateHasUnsavedChanges(newInitialCollection, newCurrentCollection);

		return {
			currentCollection: newCurrentCollection,
			initialCollection: newInitialCollection,
		};
	}

	const [collectionState, changeCollectionState] = useReducer<
		React.Reducer<CollectionState, CollectionAction>
	>(currentCollectionReducer, {
		currentCollection: null,
		initialCollection: null,
	});
	const isContributor = !!(collectionState.currentCollection?.contributors || []).find(
		(contributor) => !!contributor.profile_id && contributor.profile_id === user?.profile?.id
	);
	const isSharedWithOthers =
		!isContributor && !!(collectionState.currentCollection?.contributors?.length || 0 > 0);

	useEffect(() => {
		if (collectionState.currentCollection && contributors) {
			const userContributorRole = getContributorType(
				user,
				collectionState.currentCollection as Avo.Collection.Collection,
				contributors
			);

			if (userContributorRole === 'VIEWER') {
				setLoadingInfo(noRightsError);
			}
		}
	}, [user, collectionState.currentCollection, contributors]);

	const [draggableListButton, draggableListModal] = useDraggableListModal({
		button: {
			icon: undefined,
		},
		modal: {
			items: getFragmentsFromCollection(collectionState.currentCollection),
			onClose: (fragments?: Avo.Collection.Fragment[]) => {
				if (fragments) {
					changeCollectionState({
						type: 'UPDATE_COLLECTION_PROP',
						updateInitialCollection: false,
						collectionProp: 'collection_fragments',
						collectionPropValue: reorderFragments(fragments),
					});
				}
			},
		},
	});

	const shouldBlockNavigation = useCallback(() => {
		const editPath = isCollection
			? APP_PATH.COLLECTION_EDIT_TAB.route
			: APP_PATH.BUNDLE_EDIT_TAB.route;
		const changingRoute = !matchPath(history.location.pathname, editPath);
		return unsavedChanges && changingRoute && !isForcedExit;
	}, [history, unsavedChanges, isCollection, isForcedExit]);

	const checkPermissionsAndGetCollection = useCallback(async () => {
		try {
			const rawPermissions = await Promise.all([
				PermissionService.hasPermissions(
					[
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
					user
				),
				PermissionService.hasPermissions(
					[
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
					user
				),
				PermissionService.hasPermissions(
					[
						{
							name: isCollection
								? PermissionName.CREATE_COLLECTIONS
								: PermissionName.CREATE_BUNDLES,
						},
					],
					user
				),
				PermissionService.hasPermissions(
					[{ name: PermissionName.VIEW_ANY_PUBLISHED_ITEMS }],
					user
				),
				PermissionService.hasPermissions(
					[
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
					user
				),
			]);
			const permissionObj = {
				canEdit: rawPermissions[0],
				canDelete: rawPermissions[1],
				canCreate: rawPermissions[2],
				canViewItems: rawPermissions[3],
				canPublish: rawPermissions[4],
			};

			if (!permissionObj.canEdit) {
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

			if (contributors) {
				const userContributorRole = getContributorType(
					user,
					collectionObj as Avo.Collection.Collection,
					contributors
				);

				if (userContributorRole === 'VIEWER') {
					setLoadingInfo(noRightsError);
				}
				return;
			}

			try {
				setBookmarkViewPlayCounts(
					await BookmarksViewsPlaysService.getCollectionCounts(collectionObj.id, user)
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
				!get(collectionObj, 'management_language_check[0].qc_status') ||
				!get(collectionObj, 'management_quality_check[0].qc_status')
			) {
				set(collectionObj, 'management_approved_at[0].created_at', null);
			}

			setPermissions(permissionObj);
			changeCollectionState({
				type: 'UPDATE_COLLECTION',
				newCollection: collectionObj || null,
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
	}, [user, collectionId, setLoadingInfo, tText, isCollection, type, contributors]);

	useEffect(() => {
		checkPermissionsAndGetCollection();
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
		setCurrentTab(match.params.tabId || CollectionCreateUpdateTab.CONTENT);
	}, [match.params.tabId]);

	// Change page on tab selection
	const selectTab = (selectedTab: ReactText) => {
		const tabName = String(selectedTab) as CollectionCreateUpdateTab;
		navigate(
			history,
			isCollection ? APP_PATH.COLLECTION_EDIT_TAB.route : APP_PATH.BUNDLE_EDIT_TAB.route,
			{ id: collectionId, tabId: tabName }
		);
		setCurrentTab(tabName);
	};

	const getCollectionEditTabs = (
		user: Avo.User.User | undefined,
		isCollection: boolean
	): TabProps[] => {
		const showAdminTab: boolean = PermissionService.hasAtLeastOnePerm(
			user,
			isCollection
				? [
						PermissionName.EDIT_COLLECTION_LABELS,
						PermissionName.EDIT_COLLECTION_AUTHOR,
						PermissionName.EDIT_COLLECTION_EDITORIAL_STATUS,
				  ]
				: [
						PermissionName.EDIT_BUNDLE_LABELS,
						PermissionName.EDIT_BUNDLE_AUTHOR,
						PermissionName.EDIT_BUNDLE_EDITORIAL_STATUS,
				  ]
		);
		const showEditorialTabs = !!(
			(isCollection &&
				get(collectionState, 'currentCollection.is_managed') &&
				PermissionService.hasPerm(
					user,
					PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS
				)) ||
			(!isCollection &&
				get(collectionState, 'currentCollection.is_managed') &&
				PermissionService.hasPerm(user, PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS))
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
	const tabs: TabProps[] = getCollectionEditTabs(user, isCollection).map((tab: TabProps) => ({
		...tab,
		active: currentTab === tab.id,
	}));

	const isCollectionValid = (): ReactNode | null => {
		if (
			get(collectionState.currentCollection, 'is_managed', true) &&
			(!!get(collectionState.currentCollection, 'management_language_check[0]') ||
				!!get(collectionState.currentCollection, 'management_quality_check[0]')) &&
			!get(
				collectionState.currentCollection,
				'management_language_check[0].assignee_profile_id'
			)
		) {
			history.push(
				buildLink(
					isCollection
						? APP_PATH.COLLECTION_EDIT_TAB.route
						: APP_PATH.BUNDLE_EDIT_TAB.route,
					{
						id: collectionId,
						tabId: 'quality_check',
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

	const stripCollectionFieldsBeforeInsertOrUpdate = (collection: CollectionSchema | null) => {
		return omit(collection, ['loms', 'contributors']);
	};

	const updateCollection = async () => {
		const newCollection = await CollectionService.updateCollection(
			stripCollectionFieldsBeforeInsertOrUpdate(collectionState.initialCollection),
			stripCollectionFieldsBeforeInsertOrUpdate(collectionState.currentCollection),
			user
		);

		if (newCollection) {
			try {
				await CollectionService.deleteCollectionLomLinks(newCollection.id);

				await CollectionService.insertCollectionLomLinks(
					newCollection.id,
					(collectionState.currentCollection?.loms || []).map((lom) => lom.lom.id)
				);
			} catch (err) {
				console.error('Failed to update collection/bundle loms', err);
				ToastService.danger(
					isCollection
						? tHtml(
								'collection/components/collection-or-bundle-edit___het-updaten-van-de-publicatie-details-van-de-collectie-is-mislukt'
						  )
						: tHtml(
								'collection/components/collection-or-bundle-edit___het-updaten-van-de-publicatie-details-van-de-bundel-is-mislukt'
						  )
				);
			}
		}

		return newCollection;
	};

	// Listeners
	const onSaveCollection = async () => {
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
					checkPermissionsAndGetCollection();

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

					trackEvents(
						{
							object: String(newCollection.id),
							object_type: type,
							action: 'edit',
							resource: {
								is_public: newCollection.is_public,
								role: getContributorType(
									user,
									newCollection,
									contributors || []
								).toLowerCase(),
							},
						},
						user
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
	};

	const onClickDelete = () => {
		setIsOptionsMenuOpen(false);
		setIsDeleteModalOpen(true);
	};

	const onDeleteCollection = async () => {
		try {
			if (!collectionState.currentCollection) {
				console.error(`Failed to delete ${type} since currentCollection is undefined`);
				ToastService.info(
					isCollection
						? tHtml(
								'collection/components/collection-or-bundle-edit___het-verwijderen-van-de-collectie-is-mislukt-collectie-niet-ingesteld'
						  )
						: tHtml(
								'collection/components/collection-or-bundle-edit___het-verwijderen-van-de-bundel-is-mislukt-bundel-niet-ingesteld'
						  )
				);
				return;
			}
			await CollectionService.deleteCollectionOrBundle(collectionState.currentCollection.id);

			trackEvents(
				{
					object: String(collectionState.currentCollection.id),
					object_type: type,
					action: 'delete',
				},
				user
			);

			navigate(history, APP_PATH.WORKSPACE_TAB.route, { tabId: COLLECTIONS_ID });
			ToastService.success(
				tHtml('collection/views/collection-detail___de-collectie-werd-succesvol-verwijderd')
			);
		} catch (err) {
			console.error(err);
			ToastService.info(
				isCollection
					? tHtml(
							'collection/components/collection-or-bundle-edit___het-verwijderen-van-de-collectie-is-mislukt'
					  )
					: tHtml(
							'collection/components/collection-or-bundle-edit___het-verwijderen-van-de-bundel-is-mislukt'
					  )
			);
		}
	};

	// TODO: DISABLED FEATURE
	// const onPreviewCollection = () => {};

	const executeAction = async (item: ReactText) => {
		setIsOptionsMenuOpen(false);
		switch (item) {
			case 'delete':
				onClickDelete();
				break;

			case 'save':
				if (!isSavingCollection) {
					await onSaveCollection();
				}
				break;

			case 'openPublishModal':
				if (unsavedChanges && !get(collectionState.initialCollection, 'is_public')) {
					ToastService.info(
						tHtml(
							'collection/components/collection-or-bundle-edit___u-moet-uw-wijzigingen-eerst-opslaan'
						)
					);
				} else {
					setIsPublishModalOpen(!isPublishModalOpen);
				}
				break;

			case 'redirectToDetail':
				redirectToClientPage(
					buildLink(
						isCollection
							? APP_PATH.COLLECTION_DETAIL.route
							: APP_PATH.BUNDLE_DETAIL.route,
						{
							id: match.params.id,
						}
					),
					history
				);
				break;

			case 'addItemById':
				setEnterItemIdModalOpen(true);
				break;

			default:
				return null;
		}
	};

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
				const collectionId = get(collectionState.currentCollection, 'id');
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
					type: 'ITEM',
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
						'collection',
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
				const bundleId = get(collectionState.currentCollection, 'id');
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
					type: 'COLLECTION',
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

	const updateCollectionEditor = async () => {
		try {
			await CollectionService.updateCollectionEditor(collectionId);
		} catch (err) {
			redirectToClientPage(
				buildLink(APP_PATH.COLLECTION_DETAIL.route, { id: collectionId }),
				history
			);

			if ((err as CustomError).innerException?.additionalInfo.statusCode === 409) {
				await releaseCollectionEditStatus();
				ToastService.danger(
					tText(
						'collection/components/collection-or-bundle-edit___iemand-is-deze-collectie-reeds-aan-het-bewerken'
					)
				);
			} else {
				ToastService.danger(
					tText(
						'collection/components/collection-or-bundle-edit___verbinding-met-bewerk-server-verloren'
					)
				);
			}
		}
	};

	const releaseCollectionEditStatus = async () => {
		try {
			await CollectionService.releaseCollectionEditStatus(collectionId);
		} catch (err) {
			if ((err as CustomError)?.innerException?.additionalInfo.statusCode !== 409) {
				ToastService.danger(
					tText(
						'collection/components/collection-or-bundle-edit___er-liep-iets-fout-met-het-updaten-van-de-collectie-bewerk-status'
					)
				);
			}
		}
	};

	const onForcedExitPage = async () => {
		setIsForcedExit(true);
		try {
			if (!user.profile?.id) {
				return;
			}

			await updateCollection();

			ToastService.success(
				tText(
					'collection/components/collection-or-bundle-edit___je-was-meer-dan-15-minuten-inactief-je-aanpassingen-zijn-opgeslagen'
				),
				{
					autoClose: false,
				}
			);
		} catch (err) {
			ToastService.danger(
				tText(
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
			history
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
							history={history}
							location={location}
							match={match}
							user={user}
						/>
					);
				case CollectionCreateUpdateTab.PUBLISH:
					return (
						<CollectionOrBundleEditMetaData
							type={type}
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
						/>
					);
				case CollectionCreateUpdateTab.ADMIN:
					return (
						<CollectionOrBundleEditAdmin
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
						/>
					);
				case CollectionCreateUpdateTab.ACTUALISATION:
					return (
						<CollectionOrBundleEditActualisation
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
						/>
					);
				case CollectionCreateUpdateTab.QUALITY_CHECK:
					return (
						<CollectionOrBundleEditQualityCheck
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
						/>
					);
				case CollectionCreateUpdateTab.MARCOM:
					return (
						<CollectionOrBundleEditMarcom
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
						/>
					);
				default:
					return null;
			}
		}
	};

	const canAddItemToCollectionOrBundle = PermissionService.hasPerm(
		user,
		isCollection
			? PermissionName.ADD_ITEM_TO_COLLECTION_BY_PID
			: PermissionName.ADD_COLLECTION_TO_BUNDLE_BY_ID
	);
	const renderHeaderButtons = () => {
		const COLLECTION_DROPDOWN_ITEMS = [
			...createDropdownMenuItem('delete', 'Verwijderen', 'delete', true),
			...createDropdownMenuItem(
				'addItemById',
				isCollection
					? tText('collection/components/collection-or-bundle-edit___voeg-item-toe')
					: tText('collection/components/collection-or-bundle-edit___voeg-collectie-toe'),
				'plus',
				canAddItemToCollectionOrBundle
			),
		];

		const isPublic =
			collectionState.currentCollection && collectionState.currentCollection.is_public;
		let publishButtonTooltip: string;
		if (unsavedChanges && !get(collectionState.initialCollection, 'is_public')) {
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

		return (
			<ButtonToolbar>
				{permissions.canPublish && (
					<Button
						type="secondary"
						disabled={
							unsavedChanges && !get(collectionState.initialCollection, 'is_public')
						}
						title={publishButtonTooltip}
						ariaLabel={publishButtonTooltip}
						icon={isPublic ? IconName.unlock3 : IconName.lock}
						onClick={() => executeAction('openPublishModal')}
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
					onClick={() => executeAction('redirectToDetail')}
				/>
				{draggableListButton}
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					label={getMoreOptionsLabel()}
					menuItems={COLLECTION_DROPDOWN_ITEMS}
					onOptionClicked={executeAction}
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
					/>
				)}
			</ButtonToolbar>
		);
	};

	const renderHeaderButtonsMobile = () => {
		const COLLECTION_DROPDOWN_ITEMS = [
			...createDropdownMenuItem(
				'save',
				tText('collection/views/collection-edit___opslaan'),
				'download',
				true
			),
			...createDropdownMenuItem(
				'openPublishModal',
				tText('collection/components/collection-or-bundle-edit___delen'),
				'share-2',
				true
			),
			...createDropdownMenuItem(
				'redirectToDetail',
				tText('collection/components/collection-or-bundle-edit___bekijk'),
				'eye',
				true
			),
			...createDropdownMenuItem(
				'rename',
				isCollection
					? 'Collectie hernoemen'
					: tText('collection/components/collection-or-bundle-edit___bundel-hernoemen'),
				'folder',
				true
			),
			...createDropdownMenuItem('delete', 'Verwijderen', 'delete', true),
		];
		return (
			<ButtonToolbar>
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					label={getMoreOptionsLabel()}
					menuItems={COLLECTION_DROPDOWN_ITEMS}
					onOptionClicked={executeAction}
				/>
			</ButtonToolbar>
		);
	};

	const renderCollectionOrBundleEdit = () => {
		const { profile } = collectionState.currentCollection as Avo.Collection.Collection;

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
			<>
				<Header
					title={
						<CollectionOrBundleTitle
							title={collectionState.currentCollection?.title}
							onChange={(title) =>
								changeCollectionState({
									type: 'UPDATE_COLLECTION_PROP',
									updateInitialCollection: false,
									collectionProp: 'title',
									collectionPropValue: title,
								})
							}
						/>
					}
					category={type}
					showMetaData
					bookmarks={String(bookmarkViewPlayCounts.bookmarkCount || 0)}
					views={String(bookmarkViewPlayCounts.viewCount || 0)}
				>
					<HeaderButtons>
						{isMobileWidth() ? renderHeaderButtonsMobile() : renderHeaderButtons()}
					</HeaderButtons>

					<HeaderAvatar>{profile && renderAvatar(profile, { dark: true })}</HeaderAvatar>
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
						onSave={() => executeAction('save')}
						onCancel={() => changeCollectionState({ type: 'RESET_COLLECTION' })}
					/>
				</div>

				{!!collectionState.currentCollection && (
					<PublishCollectionModal
						collection={collectionState.currentCollection}
						isOpen={isPublishModalOpen}
						onClose={onCloseShareCollectionModal}
						history={history}
						location={location}
						match={match}
						user={user}
					/>
				)}

				<DeleteCollectionModal
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={onDeleteCollection}
					isContributor={isContributor}
					isSharedWithOthers={isSharedWithOthers}
					contributorCount={collectionState.currentCollection?.contributors?.length || 0}
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

				<InActivityWarningModal
					onActivity={updateCollectionEditor}
					onExit={releaseCollectionEditStatus}
					warningMessage={tHtml(
						'collection/components/collection-or-bundle-edit___door-inactiviteit-zal-de-collectie-zichzelf-sluiten'
					)}
					currentPath={history.location.pathname}
					editPath={APP_PATH.COLLECTION_EDIT_TAB.route}
					onForcedExit={onForcedExitPage}
				/>
				{draggableListModal}
				<BeforeUnloadPrompt when={shouldBlockNavigation()} />
			</>
		);
	};

	return (
		<>
			<MetaTags>
				<title>
					{GENERATE_SITE_TITLE(
						get(
							collectionState.currentCollection,
							'title',
							isCollection
								? tText(
										'collection/components/collection-or-bundle-edit___collectie-bewerken-titel-fallback'
								  )
								: tText(
										'collection/components/collection-or-bundle-edit___bundel-bewerken-titel-fallback'
								  )
						)
					)}
				</title>
				<meta
					name="description"
					content={get(collectionState.currentCollection, 'description') || ''}
				/>
			</MetaTags>
			<LoadingErrorLoadedComponent
				loadingInfo={loadingInfo}
				dataObject={collectionState.currentCollection}
				render={renderCollectionOrBundleEdit}
			/>
		</>
	);
};

export default compose(
	withRouter,
	withUser
)(CollectionOrBundleEdit) as FunctionComponent<CollectionOrBundleEditProps>;
