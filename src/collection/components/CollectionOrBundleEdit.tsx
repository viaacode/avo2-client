import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, eq, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useReducer, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { connect } from 'react-redux';
import { Prompt, withRouter } from 'react-router';

import {
	Button,
	ButtonToolbar,
	Container,
	DropdownButton,
	DropdownContent,
	Header,
	HeaderAvatar,
	HeaderButtons,
	MenuContent,
	Navbar,
	Spacer,
	TabProps,
	Tabs,
	Toolbar,
	ToolbarItem,
	ToolbarRight,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { getProfileName } from '../../authentication/helpers/get-profile-info';
import {
	PermissionNames,
	PermissionService,
} from '../../authentication/helpers/permission-service';
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { selectUser } from '../../authentication/store/selectors';
import { APP_PATH } from '../../constants';
import {
	ControlledDropdown,
	DeleteObjectModal,
	InputModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../shared/components';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	navigate,
	renderAvatar,
} from '../../shared/helpers';
import { ApolloCacheManager, ToastService } from '../../shared/services';
import { trackEvents } from '../../shared/services/event-logging-service';
import { ValueOf } from '../../shared/types';
import { AppState } from '../../store';

import { COLLECTIONS_ID } from '../../workspace/workspace.const';
import { COLLECTION_EDIT_TABS } from '../collection.const';
import {
	DELETE_COLLECTION,
	DELETE_COLLECTION_FRAGMENT,
	INSERT_COLLECTION_FRAGMENTS,
	UPDATE_COLLECTION,
	UPDATE_COLLECTION_FRAGMENT,
} from '../collection.gql';
import { CollectionService } from '../collection.service';
import { ShareCollectionModal } from '../components';
import { swapFragmentsPositions } from '../helpers';
import CollectionOrBundleEditContent from './CollectionOrBundleEditContent';
import CollectionOrBundleEditMetaData from './CollectionOrBundleEditMetaData';

type FragmentPropUpdateAction = {
	type: 'UPDATE_FRAGMENT_PROP';
	fragmentId: number;
	fragmentProp: keyof Avo.Collection.Fragment;
	fragmentPropValue: ValueOf<Avo.Collection.Fragment>;
};

type FragmentSwapAction = {
	type: 'SWAP_FRAGMENTS';
	currentFragmentId: number;
	direction: 'up' | 'down';
};

type CollectionUpdateAction = {
	type: 'UPDATE_COLLECTION';
	newCollection: Avo.Collection.Collection | null;
};

type CollectionPropUpdateAction = {
	type: 'UPDATE_COLLECTION_PROP';
	collectionProp: keyof Avo.Collection.Collection;
	collectionPropValue: ValueOf<Avo.Collection.Collection>;
	updateInitialCollection?: boolean;
};

export type CollectionAction =
	| FragmentPropUpdateAction
	| FragmentSwapAction
	| CollectionUpdateAction
	| CollectionPropUpdateAction;

interface CollectionState {
	currentCollection: Avo.Collection.Collection | null;
	initialCollection: Avo.Collection.Collection | null;
}

interface CollectionOrBundleEditProps extends DefaultSecureRouteProps<{ id: string }> {
	type: 'collection' | 'bundle';
}

const CollectionOrBundleEdit: FunctionComponent<CollectionOrBundleEditProps> = ({
	type,
	history,
	match,
	user,
	...rest
}) => {
	const [t] = useTranslation();

	// State
	const [collectionId] = useState<string>(match.params.id);
	const [currentTab, setCurrentTab] = useState<string>('inhoud');
	const [isOptionsMenuOpen, setIsOptionsMenuOpen] = useState<boolean>(false);
	const [isSavingCollection, setIsSavingCollection] = useState<boolean>(false);
	const [isShareModalOpen, setIsShareModalOpen] = useState<boolean>(false);
	const [isDeleteModalOpen, setIsDeleteModalOpen] = useState<boolean>(false);
	const [isRenameModalOpen, setIsRenameModalOpen] = useState<boolean>(false);
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
	// TODO: DISABLED FEATURE - const [isReorderModalOpen, setIsReorderModalOpen] = useState<boolean>(false);

	// Mutations
	const [triggerCollectionUpdate] = useMutation(UPDATE_COLLECTION);
	const [triggerCollectionDelete] = useMutation(DELETE_COLLECTION);
	const [triggerCollectionFragmentDelete] = useMutation(DELETE_COLLECTION_FRAGMENT);
	const [triggerCollectionFragmentsInsert] = useMutation(INSERT_COLLECTION_FRAGMENTS);
	const [triggerCollectionFragmentUpdate] = useMutation(UPDATE_COLLECTION_FRAGMENT);

	// Computed values
	const isCollection = type === 'collection';

	// Main collection reducer
	function currentCollectionReducer(
		collectionState: CollectionState,
		action: CollectionAction
	): CollectionState {
		if (action.type === 'UPDATE_COLLECTION') {
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
				const fragmentToUpdateIndex = newCurrentCollection.collection_fragments.findIndex(
					(item: Avo.Collection.Fragment) => item.id === action.fragmentId
				);
				newCurrentCollection.collection_fragments[fragmentToUpdateIndex] = {
					...newCurrentCollection.collection_fragments[fragmentToUpdateIndex],
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

				const fragments = CollectionService.getFragments(newCurrentCollection);

				const delta = action.direction === 'up' ? 1 : -1;

				newCurrentCollection.collection_fragments = swapFragmentsPositions(
					fragments,
					action.currentFragmentId,
					delta
				);
				break;

			case 'UPDATE_COLLECTION_PROP':
				(newCurrentCollection as any)[action.collectionProp] = action.collectionPropValue;
				if (action.updateInitialCollection) {
					(newInitialCollection as any)[action.collectionProp] =
						action.collectionPropValue;
				}
				break;
		}

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

	useEffect(() => {
		// Register listener once when the component loads
		window.addEventListener('beforeunload', onUnload);

		// Remove listener when the component unloads
		return () => window.removeEventListener('beforeunload', onUnload);
	});

	useEffect(() => {
		const checkPermissionsAndGetBundle = async () => {
			const rawPermissions = await Promise.all([
				PermissionService.hasPermissions([{ name: PermissionNames.VIEW_BUNDLES }], user),
				PermissionService.hasPermissions(
					[
						{
							name: isCollection
								? PermissionNames.EDIT_OWN_COLLECTIONS
								: PermissionNames.EDIT_OWN_BUNDLES,
							obj: collectionId,
						},
						{
							name: isCollection
								? PermissionNames.EDIT_ANY_COLLECTIONS
								: PermissionNames.EDIT_ANY_BUNDLES,
						},
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{
							name: isCollection
								? PermissionNames.DELETE_OWN_COLLECTIONS
								: PermissionNames.DELETE_OWN_BUNDLES,
							obj: collectionId,
						},
						{
							name: isCollection
								? PermissionNames.DELETE_ANY_COLLECTIONS
								: PermissionNames.DELETE_ANY_BUNDLES,
						},
					],
					user
				),
				PermissionService.hasPermissions(
					[
						{
							name: isCollection
								? PermissionNames.CREATE_COLLECTIONS
								: PermissionNames.CREATE_BUNDLES,
						},
					],
					user
				),
				PermissionService.hasPermissions([{ name: PermissionNames.VIEW_ITEMS }], user),
			]);
			const permissionObj = {
				canView: rawPermissions[0],
				canEdit: rawPermissions[1],
				canDelete: rawPermissions[2],
				canCreate: rawPermissions[3],
				canViewItems: rawPermissions[4],
			};
			const collectionObj = await CollectionService.getCollectionWithItems(
				collectionId,
				type
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
			}

			setPermissions(permissionObj);
			changeCollectionState({
				type: 'UPDATE_COLLECTION',
				newCollection: collectionObj || null,
			});
		};

		checkPermissionsAndGetBundle().catch(err => {
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
		});
	}, [user, collectionId, setLoadingInfo, t, isCollection, type]);

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

	// Change page on tab selection
	const selectTab = (selectedTab: ReactText) => {
		setCurrentTab(String(selectedTab));
	};

	// Add active state to current tab
	const tabs: TabProps[] = COLLECTION_EDIT_TABS.map((tab: TabProps) => ({
		...tab,
		active: currentTab === tab.id,
	}));

	const hasUnsavedChanged = () =>
		JSON.stringify(collectionState.currentCollection) !==
		JSON.stringify(collectionState.initialCollection);

	// Listeners
	const onSaveCollection = async () => {
		setIsSavingCollection(true);

		if (collectionState.currentCollection) {
			const newCollection = await CollectionService.updateCollection(
				collectionState.initialCollection,
				collectionState.currentCollection,
				triggerCollectionUpdate,
				triggerCollectionFragmentsInsert,
				triggerCollectionFragmentDelete,
				triggerCollectionFragmentUpdate
			);

			if (newCollection) {
				changeCollectionState({
					newCollection,
					type: 'UPDATE_COLLECTION',
				});
				ToastService.success(
					isCollection
						? t(
								'collection/components/collection-or-bundle-edit___collectie-opgeslagen'
						  )
						: t('collection/components/collection-or-bundle-edit___bundle-opgeslagen')
				);
				trackEvents(
					{
						object: String(newCollection.id),
						object_type: 'collections',
						message: `Gebruiker ${getProfileName(user)} heeft de ${type} ${
							newCollection.id
						} bijgewerkt`,
						action: 'edit',
					},
					user
				);
			}
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
			// Update the name in the current and the initial collection
			changeCollectionState({
				type: 'UPDATE_COLLECTION_PROP',
				collectionProp: 'title',
				collectionPropValue: newTitle,
				updateInitialCollection: true,
			});

			// Save the name immediately to the database
			const collectionWithNewName = {
				...collectionState.initialCollection,
				title: newTitle,
			};
			const cleanedCollection = CollectionService.cleanCollectionBeforeSave(
				collectionWithNewName
			);

			// Immediately store the new name, without the user having to click the save button twice
			await triggerCollectionUpdate({
				variables: {
					id: cleanedCollection.id,
					collection: cleanedCollection,
				},
			});
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
			await triggerCollectionDelete({
				variables: {
					id: collectionState.currentCollection.id,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			trackEvents(
				{
					object: String(collectionState.currentCollection.id),
					object_type: 'collections',
					message: `Gebruiker ${getProfileName(user)} heeft de ${type} ${
						collectionState.currentCollection.id
					} verwijderd`,
					action: 'delete',
				},
				user
			);

			navigate(history, APP_PATH.WORKSPACE_TAB.route, { tabId: COLLECTIONS_ID });
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

	const onClickDropdownItem = (item: ReactText) => {
		switch (item) {
			case 'rename':
				onClickRename();
				break;
			case 'delete':
				onClickDelete();
				break;
			default:
				return null;
		}
	};

	const onCloseShareCollectionModal = (collection?: Avo.Collection.Collection) => {
		setIsShareModalOpen(false);

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

	const onUnload = (event: any) => {
		if (hasUnsavedChanged()) {
			event.preventDefault();

			// Chrome requires returnValue to be set
			event.returnValue = '';
		}
	};

	// Render functions
	const renderSaveButton = () => (
		<Button
			type="primary"
			label={t('collection/views/collection-edit___opslaan')}
			onClick={() => onSaveCollection()}
			disabled={isSavingCollection}
		/>
	);

	const renderTab = () => {
		if (collectionState.currentCollection) {
			switch (currentTab) {
				case 'inhoud':
					return (
						<CollectionOrBundleEditContent
							type={type}
							collection={collectionState.currentCollection}
							changeCollectionState={changeCollectionState}
							history={history}
							match={match}
							user={user}
							{...rest}
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
			createDropdownMenuItem('delete', 'Verwijderen'),
		];
		return (
			<ButtonToolbar>
				<Button
					type="secondary"
					label={t('collection/views/collection-edit___delen')}
					disabled={hasUnsavedChanged()}
					title={
						!eq(collectionState.currentCollection, collectionState.initialCollection)
							? t(
									'collection/components/collection-or-bundle-edit___u-moet-uw-wijzigingen-eerst-opslaan'
							  )
							: ''
					}
					onClick={() => setIsShareModalOpen(!isShareModalOpen)}
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
					onClick={() =>
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
						)
					}
				/>
				{/* TODO: DISABLED FEATURE
					<Button
						type = "secondary"
						label={t('collection/views/collection-edit___herschik-alle-items')}
						onClick={() => setIsReorderModalOpen(!isReorderModalOpen)}
						disabled
					/>
				*/}
				<ControlledDropdown
					isOpen={isOptionsMenuOpen}
					menuWidth="fit-content"
					onOpen={() => setIsOptionsMenuOpen(true)}
					onClose={() => setIsOptionsMenuOpen(false)}
					placement="bottom-end"
				>
					<DropdownButton>
						<Button type="secondary" icon="more-horizontal" />
					</DropdownButton>
					<DropdownContent>
						<MenuContent
							menuItems={COLLECTION_DROPDOWN_ITEMS}
							onClick={onClickDropdownItem}
						/>
					</DropdownContent>
				</ControlledDropdown>
				<Spacer margin="left-small">{renderSaveButton()}</Spacer>
			</ButtonToolbar>
		);
	};

	const renderCollectionOrBundleEdit = () => {
		const { profile, title } = collectionState.currentCollection as Avo.Collection.Collection;

		return (
			<>
				<Prompt
					when={hasUnsavedChanged()}
					message={t(
						'collection/components/collection-or-bundle-edit___er-zijn-nog-niet-opgeslagen-wijzigingen-weet-u-zeker-dat-u-de-pagina-wil-verlaten'
					)}
				/>
				<Header
					title={title}
					onClickTitle={() => setIsRenameModalOpen(true)}
					category={type}
					showMetaData
					bookmarks="0" // TODO: Real bookmark count
					views="0" // TODO: Real view count
				>
					<HeaderButtons>{renderHeaderButtons()}</HeaderButtons>
					<HeaderAvatar>
						{profile && renderAvatar(profile, { includeRole: true, dark: true })}
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
							<ToolbarRight>
								<ToolbarItem>
									<ButtonToolbar>{renderSaveButton()}</ButtonToolbar>
								</ToolbarItem>
							</ToolbarRight>
						</Toolbar>
					</Container>
				</Container>
				{/* TODO: DISABLED_FEATURE
					<ReorderCollectionModal
						isOpen={isReorderModalOpen}
						onClose={() => setIsReorderModalOpen(false)}
					/>
				*/}
				<ShareCollectionModal
					collection={collectionState.currentCollection as Avo.Collection.Collection}
					isOpen={isShareModalOpen}
					onClose={onCloseShareCollectionModal}
					setIsPublic={(value: boolean) =>
						changeCollectionState({
							type: 'UPDATE_COLLECTION_PROP',
							collectionProp: 'is_public',
							collectionPropValue: value,
						})
					}
					history={history}
					match={match}
					user={user}
					{...rest}
				/>
				<DeleteObjectModal
					title={
						isCollection
							? t(
									'collection/components/collection-or-bundle-edit___ben-je-zeker-dat-je-deze-collectie-wil-verwijderen'
							  )
							: t(
									'collection/components/collection-or-bundle-edit___ben-je-zeker-dat-je-deze-bundel-wil-verwijderen'
							  )
					}
					body={t(
						'collection/components/collection-or-bundle-edit___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
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
							? t('collection/components/collection-or-bundle-edit___naam-collectie')
							: t('collection/components/collection-or-bundle-edit___naam-bundel')
					}
					inputValue={title}
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
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={collectionState.currentCollection}
			render={renderCollectionOrBundleEdit}
		/>
	);
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
});

export default withRouter(connect(mapStateToProps)(CollectionOrBundleEdit));
