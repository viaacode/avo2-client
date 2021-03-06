import { cloneDeep, get, isEmpty, set, truncate } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactNode,
	ReactText,
	useCallback,
	useEffect,
	useReducer,
	useState,
} from 'react';
import BeforeUnloadComponent from 'react-beforeunload-component';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { matchPath, withRouter } from 'react-router';
import { compose } from 'redux';

import {
	BlockHeading,
	Button,
	ButtonToolbar,
	Container,
	Flex,
	FlexItem,
	Header,
	HeaderAvatar,
	HeaderButtons,
	Navbar,
	Spacer,
	TabProps,
	Tabs,
	Toolbar,
	ToolbarItem,
	ToolbarLeft,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ItemsService } from '../../admin/items/items.service';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../constants';
import {
	DeleteObjectModal,
	DraggableListModal,
	InputModal,
	InteractiveTour,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import MoreOptionsDropdown from '../../shared/components/MoreOptionsDropdown/MoreOptionsDropdown';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	isMobileWidth,
	navigate,
	renderAvatar,
	stripHtml,
} from '../../shared/helpers';
import { convertRteToString } from '../../shared/helpers/convert-rte-to-string';
import withUser from '../../shared/hocs/withUser';
import { BookmarksViewsPlaysService, ToastService } from '../../shared/services';
import { DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS } from '../../shared/services/bookmarks-views-plays-service';
import { BookmarkViewPlayCounts } from '../../shared/services/bookmarks-views-plays-service/bookmarks-views-plays-service.types';
import { trackEvents } from '../../shared/services/event-logging-service';
import i18n from '../../shared/translations/i18n';
import { ValueOf } from '../../shared/types';
import { COLLECTIONS_ID } from '../../workspace/workspace.const';
import { MAX_TITLE_LENGTH } from '../collection.const';
import { getFragmentsFromCollection, reorderFragments } from '../collection.helpers';
import { CollectionService } from '../collection.service';
import { EditCollectionTab, toDutchContentType } from '../collection.types';
import { PublishCollectionModal } from '../components';
import { getFragmentProperty } from '../helpers';

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

export type CollectionAction =
	| FragmentPropUpdateAction
	| FragmentSwapAction
	| FragmentInsertAction
	| FragmentDeleteAction
	| CollectionUpdateAction
	| CollectionPropUpdateAction;

interface CollectionState {
	currentCollection: Avo.Collection.Collection | null;
	initialCollection: Avo.Collection.Collection | null;
}

interface CollectionOrBundleEditProps {
	type: 'collection' | 'bundle';
}

const CollectionOrBundleEdit: FunctionComponent<
	CollectionOrBundleEditProps &
		DefaultSecureRouteProps<{ id: string; tabId: EditCollectionTab | undefined }>
> = ({ type, history, location, match, user }) => {
	const [t] = useTranslation();

	// State
	const [collectionId] = useState<string>(match.params.id);
	const [currentTab, setCurrentTab] = useState<EditCollectionTab | null>(null);
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isSavingCollection, setIsSavingCollection] = useState<boolean>(false);
	const [isPublishModalOpen, setIsPublishModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
	const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);
	const [isEnterItemIdModalOpen, setEnterItemIdModalOpen] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [permissions, setPermissions] = useState<
		Partial<{
			canView: boolean;
			canEdit: boolean;
			canDelete: boolean;
			canCreate: boolean;
			canViewItems: boolean;
		}>
	>({});
	const [bookmarkViewPlayCounts, setBookmarkViewPlayCounts] = useState<BookmarkViewPlayCounts>(
		DEFAULT_BOOKMARK_VIEW_PLAY_COUNTS
	);
	const [unsavedChanges, setUnsavedChanges] = useState<boolean>(false);

	// Computed values
	const isCollection = type === 'collection';

	const updateHasUnsavedChanges = (
		initialCollection: Avo.Collection.Collection | null,
		currentCollection: Avo.Collection.Collection | null
	): void => {
		const hasChanges =
			JSON.stringify(convertRteToString(initialCollection)) !==
			JSON.stringify(convertRteToString(currentCollection));
		setUnsavedChanges(hasChanges);
	};

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

		const newCurrentCollection: Avo.Collection.Collection | null = cloneDeep(
			collectionState.currentCollection
		);
		const newInitialCollection: Avo.Collection.Collection | null = cloneDeep(
			collectionState.initialCollection
		);

		if (!newCurrentCollection) {
			ToastService.danger(
				isCollection
					? t(
							'collection/components/collection-or-bundle-edit___de-collectie-is-nog-niet-geladen'
					  )
					: t(
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

			case 'SWAP_FRAGMENTS':
				if (
					!newCurrentCollection.collection_fragments ||
					!newCurrentCollection.collection_fragments.length
				) {
					ToastService.danger(
						isCollection
							? t(
									'collection/components/collection-or-bundle-edit___de-collectie-lijkt-geen-fragmenten-te-bevatten'
							  )
							: t(
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

	const shouldBlockNavigation = useCallback(() => {
		const editPath = isCollection
			? APP_PATH.COLLECTION_EDIT_TAB.route
			: APP_PATH.BUNDLE_EDIT_TAB.route;
		const changingRoute: boolean = !matchPath(history.location.pathname, editPath);
		return unsavedChanges && changingRoute;
	}, [history, unsavedChanges, isCollection]);

	const onUnload = useCallback(
		(event: any) => {
			if (shouldBlockNavigation()) {
				event.preventDefault();

				// Chrome requires returnValue to be set
				event.returnValue = '';
			}
		},
		[shouldBlockNavigation]
	);

	useEffect(() => {
		// Register listener once when the component loads
		window.addEventListener('beforeunload', onUnload);

		// Remove listener when the component unloads
		return () => window.removeEventListener('beforeunload', onUnload);
	}, [onUnload]);

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
			]);
			const permissionObj = {
				canEdit: rawPermissions[0],
				canDelete: rawPermissions[1],
				canCreate: rawPermissions[2],
				canViewItems: rawPermissions[3],
			};

			if (!permissionObj.canEdit) {
				setLoadingInfo({
					state: 'error',
					message: isCollection
						? t(
								'collection/components/collection-or-bundle-edit___je-hebt-geen-rechten-om-deze-collectie-te-bewerken'
						  )
						: t(
								'collection/components/collection-or-bundle-edit___je-hebt-geen-rechten-om-deze-bundel-te-bewerken'
						  ),
					icon: 'alert-triangle',
				});
				return;
			}

			const collectionObj = await CollectionService.fetchCollectionOrBundleById(
				collectionId,
				type,
				undefined
			);

			if (!collectionObj) {
				setLoadingInfo({
					state: 'error',
					message: isCollection
						? t(
								'collection/views/collection-detail___de-collectie-kon-niet-worden-gevonden'
						  )
						: t('bundle/views/bundle-detail___de-bundel-kon-niet-worden-gevonden'),
					icon: 'search',
				});
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
					t(
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
					? t(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-tijdens-het-ophalen-van-de-collectie'
					  )
					: t(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-tijdens-het-ophalen-van-de-bundel'
					  ),
				icon: 'alert-triangle',
			});
		}
	}, [user, collectionId, setLoadingInfo, t, isCollection, type]);

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
		setCurrentTab(match.params.tabId || 'content');
	}, [match.params.tabId]);

	// Change page on tab selection
	const selectTab = (selectedTab: ReactText) => {
		const tabName = String(selectedTab) as EditCollectionTab;
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
		const showEditorialTabs: boolean =
			(isCollection &&
				get(collectionState, 'currentCollection.is_managed') &&
				PermissionService.hasPerm(
					user,
					PermissionName.VIEW_COLLECTION_EDITORIAL_OVERVIEWS
				)) ||
			(!isCollection &&
				get(collectionState, 'currentCollection.is_managed') &&
				PermissionService.hasPerm(user, PermissionName.VIEW_BUNDLE_EDITORIAL_OVERVIEWS));
		return [
			{
				id: 'content',
				label: i18n.t('collection/collection___inhoud'),
				icon: 'collection',
			},
			{
				id: 'metadata',
				label: i18n.t('collection/collection___publicatiedetails'),
				icon: 'file-text',
			},
			...(showAdminTab
				? [
						{
							id: 'admin',
							label: i18n.t('collection/collection___beheer'),
							icon: 'settings',
						} as TabProps,
				  ]
				: []),
			...(showEditorialTabs
				? [
						{
							id: 'actualisation',
							label: i18n.t(
								'collection/components/collection-or-bundle-edit___actualisatie'
							),
							icon: 'check-circle',
						} as TabProps,
						{
							id: 'quality_check',
							label: i18n.t(
								'collection/components/collection-or-bundle-edit___kwaliteitscontrole'
							),
							icon: 'check-square',
						} as TabProps,
						{
							id: 'marcom',
							label: i18n.t(
								'collection/components/collection-or-bundle-edit___marcom'
							),
							icon: 'send',
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

	const isCollectionValid = (): string | null => {
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
				? t(
						'collection/components/collection-or-bundle-edit___een-collectie-met-redactie-moet-een-kwaliteitscontrole-verantwoordelijke-hebben'
				  )
				: t(
						'collection/components/collection-or-bundle-edit___een-bundel-met-redactie-moet-een-kwaliteitscontrole-verantwoordelijke-hebben'
				  );
		}
		return null;
	};

	// Listeners
	const onSaveCollection = async () => {
		setIsSavingCollection(true);
		try {
			const validationError: string | null = isCollectionValid();
			if (validationError) {
				ToastService.danger(validationError);
				setIsSavingCollection(false);
				return;
			}

			if (collectionState.currentCollection) {
				const newCollection = await CollectionService.updateCollection(
					collectionState.initialCollection,
					collectionState.currentCollection,
					user
				);

				if (newCollection) {
					checkPermissionsAndGetCollection();
					ToastService.success(
						isCollection
							? t(
									'collection/components/collection-or-bundle-edit___collectie-opgeslagen'
							  )
							: t(
									'collection/components/collection-or-bundle-edit___bundle-opgeslagen'
							  )
					);
					trackEvents(
						{
							object: String(newCollection.id),
							object_type: type,
							message: `Gebruiker ${getProfileName(
								user
							)} heeft een ${type} aangepast`,
							action: 'edit',
						},
						user
					);
				}
			}
		} catch (err) {
			console.error('Failed to save collection/bundle to the database', err);
			ToastService.danger(
				isCollection
					? t(
							'collection/components/collection-or-bundle-edit___het-opslaan-van-de-collectie-is-mislukt'
					  )
					: t(
							'collection/components/collection-or-bundle-edit___het-opslaan-van-de-bundel-is-mislukt'
					  )
			);
		}
		setIsSavingCollection(false);
	};

	const onClickRename = () => {
		setIsOptionsMenuOpen(false);
		setIsRenameModalOpen(true);
	};

	const onRenameCollection = async (newTitle: string) => {
		try {
			if (!collectionState.initialCollection) {
				ToastService.info(
					isCollection
						? t(
								'collection/components/collection-or-bundle-edit___de-collectie-naam-kon-niet-geupdate-worden-collectie-is-niet-gedefinieerd'
						  )
						: t(
								'collection/components/collection-or-bundle-edit___de-bundel-naam-kon-niet-geupdate-worden-bundel-is-niet-gedefinieerd'
						  )
				);
				return;
			}

			// Save the name immediately to the database
			const collectionWithNewName = {
				...collectionState.initialCollection,
				title: newTitle,
			};

			// Immediately store the new name, without the user having to click the save button twice
			const newCollection = await CollectionService.updateCollection(
				collectionState.initialCollection,
				collectionWithNewName,
				user
			);

			if (newCollection) {
				// Update the name in the current and the initial collection
				changeCollectionState({
					type: 'UPDATE_COLLECTION_PROP',
					collectionProp: 'title',
					collectionPropValue: newTitle,
					updateInitialCollection: true,
				});

				ToastService.success(
					isCollection
						? t(
								'collection/components/collection-or-bundle-edit___de-collectie-naam-is-aangepast'
						  )
						: t(
								'collection/components/collection-or-bundle-edit___de-bundel-naam-is-aangepast'
						  )
				);
			} // else collection wasn't saved because of validation errors
		} catch (err) {
			console.error(err);
			ToastService.info(
				isCollection
					? t(
							'collection/components/collection-or-bundle-edit___het-hernoemen-van-de-collectie-is-mislukt'
					  )
					: t(
							'collection/components/collection-or-bundle-edit___het-hernoemen-van-de-bundel-is-mislukt'
					  )
			);
		}
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
						? t(
								'collection/components/collection-or-bundle-edit___het-verwijderen-van-de-collectie-is-mislukt-collectie-niet-ingesteld'
						  )
						: t(
								'collection/components/collection-or-bundle-edit___het-verwijderen-van-de-bundel-is-mislukt-bundel-niet-ingesteld'
						  )
				);
				return;
			}
			await CollectionService.deleteCollection(collectionState.currentCollection.id);

			trackEvents(
				{
					object: String(collectionState.currentCollection.id),
					object_type: type,
					message: `Gebruiker ${getProfileName(user)} heeft een ${toDutchContentType(
						type
					)} verwijderd`,
					action: 'delete',
				},
				user
			);

			navigate(history, APP_PATH.WORKSPACE_TAB.route, { tabId: COLLECTIONS_ID });
			ToastService.success(
				t('collection/views/collection-detail___de-collectie-werd-succesvol-verwijderd')
			);
		} catch (err) {
			console.error(err);
			ToastService.info(
				isCollection
					? t(
							'collection/components/collection-or-bundle-edit___het-verwijderen-van-de-collectie-is-mislukt'
					  )
					: t(
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
			case 'rename':
				onClickRename();
				break;

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
						t(
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

	// Render functions
	const renderSaveButton = () => (
		<Button
			type="primary"
			label={t('collection/views/collection-edit___opslaan')}
			onClick={() => executeAction('save')}
			disabled={isSavingCollection}
		/>
	);

	const handleReorderModalClosed = (fragments?: Avo.Collection.Fragment[]) => {
		if (fragments) {
			changeCollectionState({
				type: 'UPDATE_COLLECTION_PROP',
				updateInitialCollection: false,
				collectionProp: 'collection_fragments',
				collectionPropValue: reorderFragments(fragments),
			});
		}
		setIsReorderModalOpen(false);
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
					t(
						'collection/components/collection-or-bundle-edit___het-item-is-toegevoegd-aan-de-collectie'
					)
				);
			} else {
				// We're adding a collection to the bundle
				const collection: Avo.Collection.Collection | null = await CollectionService.fetchCollectionOrBundleById(
					id,
					'collection',
					undefined,
					false
				);
				if (!collection) {
					ToastService.danger(
						t(
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
					t(
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
					? t(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-bij-het-toevoegen-van-het-item'
					  )
					: t(
							'collection/components/collection-or-bundle-edit___er-ging-iets-mis-bij-het-toevoegen-van-de-collectie'
					  )
			);
		}
	};

	const renderDraggableFragment = (fragment: Avo.Collection.Fragment): ReactNode => {
		const thumbnail =
			get(fragment, 'thumbnail_path') || get(fragment, 'item_meta.thumbnail_path');
		return (
			<Flex className="c-collection-or-bundle-edit__draggable-item" center>
				<FlexItem shrink>
					{<div style={{ backgroundImage: `url(${thumbnail})` }} />}
				</FlexItem>
				<FlexItem>
					<BlockHeading type="h4">
						{truncate(
							getFragmentProperty(
								fragment.item_meta,
								fragment,
								fragment.use_custom_fields,
								'title'
							) ||
								stripHtml(
									getFragmentProperty(
										fragment.item_meta,
										fragment,
										fragment.use_custom_fields,
										'description'
									) || ''
								),
							{ length: 45 }
						)}
					</BlockHeading>
				</FlexItem>
			</Flex>
		);
	};

	const renderTab = () => {
		if (collectionState.currentCollection) {
			switch (currentTab) {
				case 'content':
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
				case 'metadata':
					return (
						<CollectionOrBundleEditMetaData
							type={type}
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
						/>
					);
				case 'admin':
					return (
						<CollectionOrBundleEditAdmin
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
						/>
					);
				case 'actualisation':
					return (
						<CollectionOrBundleEditActualisation
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
						/>
					);
				case 'quality_check':
					return (
						<CollectionOrBundleEditQualityCheck
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
						/>
					);
				case 'marcom':
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

	const renderHeaderButtons = () => {
		const COLLECTION_DROPDOWN_ITEMS = [
			createDropdownMenuItem(
				'rename',
				isCollection
					? 'Collectie hernoemen'
					: t('collection/components/collection-or-bundle-edit___bundel-hernoemen'),
				'folder'
			),
			createDropdownMenuItem('delete', 'Verwijderen', 'delete'),
		];
		if (
			PermissionService.hasPerm(
				user,
				isCollection
					? PermissionName.ADD_ITEM_TO_COLLECTION_BY_PID
					: PermissionName.ADD_COLLECTION_TO_BUNDLE_BY_ID
			)
		) {
			COLLECTION_DROPDOWN_ITEMS.push(
				createDropdownMenuItem(
					'addItemById',
					isCollection
						? t('collection/components/collection-or-bundle-edit___voeg-item-toe')
						: t('collection/components/collection-or-bundle-edit___voeg-collectie-toe'),
					'plus'
				)
			);
		}

		const isPublic =
			collectionState.currentCollection && collectionState.currentCollection.is_public;
		let publishButtonTooltip: string;
		if (unsavedChanges && !get(collectionState.initialCollection, 'is_public')) {
			publishButtonTooltip = t(
				'collection/components/collection-or-bundle-edit___u-moet-uw-wijzigingen-eerst-opslaan'
			);
		} else if (isPublic) {
			if (isCollection) {
				publishButtonTooltip = t(
					'collection/views/collection-detail___maak-deze-collectie-prive'
				);
			} else {
				publishButtonTooltip = t('bundle/views/bundle-detail___maak-deze-bundel-prive');
			}
		} else {
			if (isCollection) {
				publishButtonTooltip = t(
					'collection/views/collection-detail___maak-deze-collectie-openbaar'
				);
			} else {
				publishButtonTooltip = t('bundle/views/bundle-detail___maak-deze-bundel-openbaar');
			}
		}

		return (
			<ButtonToolbar>
				<Button
					type="secondary"
					disabled={
						unsavedChanges && !get(collectionState.initialCollection, 'is_public')
					}
					title={publishButtonTooltip}
					ariaLabel={publishButtonTooltip}
					icon={isPublic ? 'unlock-3' : 'lock'}
					onClick={() => executeAction('openPublishModal')}
				/>
				<Button
					type="secondary"
					label={t('collection/components/collection-or-bundle-edit___bekijk')}
					title={
						isCollection
							? t(
									'collection/components/collection-or-bundle-edit___bekijk-hoe-de-collectie-er-zal-uit-zien'
							  )
							: t(
									'collection/components/collection-or-bundle-edit___bekijk-hoe-de-bundel-er-zal-uit-zien'
							  )
					}
					onClick={() => executeAction('redirectToDetail')}
				/>
				<Button
					type="secondary"
					label={t(
						'collection/components/collection-or-bundle-edit___herorden-fragmenten'
					)}
					title={t(
						'collection/components/collection-or-bundle-edit___herorden-de-fragmenten-via-drag-and-drop'
					)}
					onClick={() => setIsReorderModalOpen(true)}
				/>
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					menuItems={COLLECTION_DROPDOWN_ITEMS}
					onOptionClicked={executeAction}
				/>
				<Spacer margin="left-small">{renderSaveButton()}</Spacer>
				<InteractiveTour showButton />
			</ButtonToolbar>
		);
	};

	const renderHeaderButtonsMobile = () => {
		const COLLECTION_DROPDOWN_ITEMS = [
			createDropdownMenuItem(
				'save',
				t('collection/views/collection-edit___opslaan'),
				'download'
			),
			createDropdownMenuItem(
				'openPublishModal',
				t('collection/components/collection-or-bundle-edit___delen'),
				'share-2'
			),
			createDropdownMenuItem(
				'redirectToDetail',
				t('collection/components/collection-or-bundle-edit___bekijk'),
				'eye'
			),
			createDropdownMenuItem(
				'rename',
				isCollection
					? 'Collectie hernoemen'
					: t('collection/components/collection-or-bundle-edit___bundel-hernoemen'),
				'folder'
			),
			createDropdownMenuItem('delete', 'Verwijderen', 'delete'),
		];
		return (
			<ButtonToolbar>
				<MoreOptionsDropdown
					isOpen={isOptionsMenuOpen}
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					menuItems={COLLECTION_DROPDOWN_ITEMS}
					onOptionClicked={executeAction}
				/>
			</ButtonToolbar>
		);
	};

	const renderCollectionOrBundleEdit = () => {
		const { profile, title } = collectionState.currentCollection as Avo.Collection.Collection;

		return (
			<>
				<BeforeUnloadComponent
					blockRoute={unsavedChanges}
					modalComponentHandler={({
						handleModalLeave,
						handleModalCancel,
					}: {
						handleModalLeave: () => void;
						handleModalCancel: () => void;
					}) => {
						return (
							<DeleteObjectModal
								isOpen={true}
								body={t(
									'collection/components/collection-or-bundle-edit___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
								)}
								onClose={handleModalCancel}
								deleteObjectCallback={handleModalLeave}
								cancelLabel={t(
									'collection/components/collection-or-bundle-edit___blijven'
								)}
								confirmLabel={t(
									'collection/components/collection-or-bundle-edit___verlaten'
								)}
								title={t(
									'collection/components/collection-or-bundle-edit___niet-opgeslagen-wijzigingen'
								)}
								confirmButtonType="primary"
							/>
						);
					}}
				>
					<Header
						title={title}
						onClickTitle={() => setIsRenameModalOpen(true)}
						category={type}
						showMetaData
						bookmarks={String(bookmarkViewPlayCounts.bookmarkCount || 0)}
						views={String(bookmarkViewPlayCounts.viewCount || 0)}
					>
						<HeaderButtons>
							{isMobileWidth() ? renderHeaderButtonsMobile() : renderHeaderButtons()}
						</HeaderButtons>
						<HeaderAvatar>
							{profile && renderAvatar(profile, { dark: true })}
						</HeaderAvatar>
					</Header>
					<Navbar background="alt" placement="top" autoHeight>
						<Container mode="horizontal">
							<Tabs tabs={tabs} onClick={selectTab} />
						</Container>
					</Navbar>
					{renderTab()}
					<Container background="alt" mode="vertical">
						<Container mode="horizontal">
							<Toolbar autoHeight>
								<ToolbarLeft>
									<ToolbarItem>
										<ButtonToolbar>{renderSaveButton()}</ButtonToolbar>
									</ToolbarItem>
								</ToolbarLeft>
							</Toolbar>
						</Container>
					</Container>
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
						collectionId={
							(collectionState.currentCollection as Avo.Collection.Collection).id
						}
						isOpen={isDeleteModalOpen}
						onClose={() => setIsDeleteModalOpen(false)}
						deleteObjectCallback={onDeleteCollection}
					/>
					<InputModal
						title={
							isCollection
								? t('collection/views/collection-edit___hernoem-deze-collectie')
								: t(
										'collection/components/collection-or-bundle-edit___hernoem-deze-bundel'
								  )
						}
						inputLabel={
							isCollection
								? t(
										'collection/components/collection-or-bundle-edit___naam-collectie'
								  )
								: t('collection/components/collection-or-bundle-edit___naam-bundel')
						}
						inputValue={title}
						maxLength={MAX_TITLE_LENGTH}
						isOpen={isRenameModalOpen}
						onClose={() => setIsRenameModalOpen(false)}
						inputCallback={onRenameCollection}
						emptyMessage={
							isCollection
								? t(
										'collection/components/collection-or-bundle-edit___gelieve-een-collectie-titel-in-te-vullen'
								  )
								: t(
										'collection/components/collection-or-bundle-edit___gelieve-een-bundel-titel-in-te-vullen'
								  )
						}
					/>
					<InputModal
						title={
							isCollection
								? t(
										'collection/components/collection-or-bundle-edit___voeg-item-toe-via-pid'
								  )
								: t(
										'collection/components/collection-or-bundle-edit___voeg-collectie-toe-via-id'
								  )
						}
						inputLabel={t('collection/components/collection-or-bundle-edit___id')}
						inputPlaceholder={
							isCollection
								? t(
										'collection/components/collection-or-bundle-edit___bijvoorbeeld-zg-6-g-181-x-5-j'
								  )
								: t(
										'collection/components/collection-or-bundle-edit___bijvoorbeeld-c-8-a-48-b-7-e-d-27-d-4-b-9-a-a-793-9-ba-79-fff-41-df'
								  )
						}
						isOpen={isEnterItemIdModalOpen}
						onClose={() => setEnterItemIdModalOpen(false)}
						inputCallback={handleAddItemById}
					/>
					<DraggableListModal
						items={getFragmentsFromCollection(collectionState.currentCollection)}
						renderItem={renderDraggableFragment}
						isOpen={isReorderModalOpen}
						onClose={handleReorderModalClosed}
					/>
				</BeforeUnloadComponent>
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
								? t(
										'collection/components/collection-or-bundle-edit___collectie-bewerken-titel-fallback'
								  )
								: t(
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

export default compose(withRouter, withUser)(CollectionOrBundleEdit) as FunctionComponent<
	CollectionOrBundleEditProps
>;
