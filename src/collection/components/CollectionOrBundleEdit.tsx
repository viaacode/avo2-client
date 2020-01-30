import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, eq, isEmpty } from 'lodash-es';
import React, { FunctionComponent, ReactText, useEffect, useState } from 'react';
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
import { redirectToClientPage } from '../../authentication/helpers/redirects';
import { selectUser } from '../../authentication/store/selectors';
import { APP_PATH } from '../../constants';
import {
	ControlledDropdown,
	DeleteObjectModal,
	InputModal,
	LoadingErrorLoadedComponent,
} from '../../shared/components';
import {
	buildLink,
	createDropdownMenuItem,
	CustomError,
	navigate,
	renderAvatar,
} from '../../shared/helpers';
import { ApolloCacheManager } from '../../shared/services/data-service';
import { trackEvents } from '../../shared/services/event-logging-service';
import toastService from '../../shared/services/toast-service';
import { AppState } from '../../store';
import { COLLECTIONS_ID, WORKSPACE_PATH } from '../../workspace/workspace.const';

import {
	PermissionNames,
	PermissionService,
} from '../../authentication/helpers/permission-service';
import { LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
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
	const [initialCollection, setInitialCollection] = useState<Avo.Collection.Collection | null>(
		null
	);
	const [currentCollection, setCurrentCollection] = useState<Avo.Collection.Collection | null>(
		null
	);
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

	const isCollection = type === 'collection';

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
			const collectionObj = await CollectionService.getCollectionWithItems(collectionId, type);

			if (!collectionObj) {
				setLoadingInfo({
					state: 'error',
					message: isCollection
						? t('De collectie kon niet worden gevonden')
						: t('De bundel kon niet worden gevonden'),
					icon: 'search',
				});
			}

			setPermissions(permissionObj);
			setCurrentCollection(collectionObj || null);
			setInitialCollection(collectionObj || null);
		};

		checkPermissionsAndGetBundle().catch(err => {
			console.error(
				new CustomError(`Failed to check permissions or get ${type} from the database`, err, {
					collectionId,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? t('Er ging iets mis tijdens het ophalen van de collectie')
					: t('Er ging iets mis tijdens het ophalen van de bundel'),
				icon: 'alert-triangle',
			});
		});
	}, [user, collectionId, setLoadingInfo, t, isCollection, type]);

	useEffect(() => {
		if (currentCollection && initialCollection && !isEmpty(permissions)) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [currentCollection, initialCollection, permissions]);

	// Change page on tab selection
	const selectTab = (selectedTab: ReactText) => {
		setCurrentTab(String(selectedTab));
	};

	// Add active state to current tab
	const tabs: TabProps[] = COLLECTION_EDIT_TABS.map((tab: TabProps) => ({
		...tab,
		active: currentTab === tab.id,
	}));

	// Update individual property of collection
	const updateCollectionProperty = (value: any, fieldName: string) => {
		setCurrentCollection({
			...currentCollection,
			[fieldName]: value,
		} as Avo.Collection.Collection);
	};

	// Update individual property of fragment
	const onFragmentChanged = (fragment: Avo.Collection.Fragment) => {
		console.log('fragment props updated: ', fragment);
		const tempCollection: Avo.Collection.Collection | null = cloneDeep(currentCollection);

		if (!tempCollection) {
			toastService.danger(
				isCollection
					? t('De collectie updaten is mislukt, kon geen kopie maken van de bestaande collectie')
					: t('De bundel updaten is mislukt, kon geen kopie maken van de bestaande bundel')
			);
			return;
		}

		const fragmentToUpdateIndex = tempCollection.collection_fragments.findIndex(
			(item: Avo.Collection.Fragment) => item.id === fragment.id
		);
		tempCollection.collection_fragments[fragmentToUpdateIndex] = fragment;

		setCurrentCollection(tempCollection);
	};

	// Swap position of two fragments within a collection
	const swapFragments = (currentFragmentId: number, direction: 'up' | 'down') => {
		if (!currentCollection) {
			toastService.danger(
				isCollection ? t('De collectie is nog niet geladen') : t('De bundel is nog niet geladen')
			);
			return;
		}

		if (!currentCollection.collection_fragments || !currentCollection.collection_fragments.length) {
			toastService.danger(
				isCollection
					? t('De collectie lijkt geen fragmenten te bevatten')
					: t('Deze bundel lijkt geen collecties te bevatten')
			);
			return;
		}

		const fragments = CollectionService.getFragments(currentCollection);

		const delta = direction === 'up' ? 1 : -1;

		setCurrentCollection({
			...currentCollection,
			collection_fragments: swapFragmentsPositions(fragments, currentFragmentId, delta),
		});
	};

	const hasUnsavedChanged = () =>
		JSON.stringify(currentCollection) !== JSON.stringify(initialCollection);

	// Listeners
	const onSaveCollection = async () => {
		setIsSavingCollection(true);

		if (currentCollection) {
			const newCollection = await CollectionService.updateCollection(
				initialCollection,
				currentCollection,
				triggerCollectionUpdate,
				triggerCollectionFragmentsInsert,
				triggerCollectionFragmentDelete,
				triggerCollectionFragmentUpdate
			);

			if (newCollection) {
				setCurrentCollection(newCollection);
				setInitialCollection(cloneDeep(newCollection));
				toastService.success(isCollection ? t(`Collectie opgeslagen`) : t('Bundle opgeslagen'));
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
			if (!initialCollection) {
				toastService.info(
					isCollection
						? t('De collectie naam kon niet geupdate worden (collectie is niet gedefinieerd)')
						: t('De bundel naam kon niet geupdate worden (bundel is niet gedefinieerd)')
				);
				return;
			}
			// Update the name in the current collection
			updateCollectionProperty(newTitle, 'title');

			const collectionWithNewName = {
				...initialCollection,
				title: newTitle,
			};
			// Update the name in the initial collection
			setInitialCollection(collectionWithNewName);
			const cleanedCollection = CollectionService.cleanCollectionBeforeSave(collectionWithNewName);

			// Immediately store the new name, without the user having to click the save button twice
			await triggerCollectionUpdate({
				variables: {
					id: cleanedCollection.id,
					collection: cleanedCollection,
				},
			});
		} catch (err) {
			console.error(err);
			toastService.info(
				isCollection
					? t('Het hernoemen van de collectie is mislukt')
					: t('Het hernoemen van de bundel is mislukt')
			);
		}
	};

	const onClickDelete = () => {
		setIsOptionsMenuOpen(false);
		setIsDeleteModalOpen(true);
	};

	const onDeleteCollection = async () => {
		try {
			if (!currentCollection) {
				console.error(`Failed to delete ${type} since currentCollection is undefined`);
				toastService.info(
					isCollection
						? t('Het verwijderen van de collectie is mislukt (collectie niet ingesteld)')
						: t('Het verwijderen van de bundel is mislukt (bundel niet ingesteld)')
				);
				return;
			}
			await triggerCollectionDelete({
				variables: {
					id: currentCollection.id,
				},
				update: ApolloCacheManager.clearCollectionCache,
			});

			trackEvents(
				{
					object: String(currentCollection.id),
					object_type: 'collections',
					message: `Gebruiker ${getProfileName(user)} heeft de ${type} ${
						currentCollection.id
					} verwijderd`,
					action: 'delete',
				},
				user
			);

			navigate(history, WORKSPACE_PATH.WORKSPACE_TAB, { tabId: COLLECTIONS_ID });
		} catch (err) {
			console.error(err);
			toastService.info(
				isCollection
					? t('Het verwijderen van de collectie is mislukt')
					: t('Het verwijderen van de bundel is mislukt')
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
			if (currentCollection) {
				setCurrentCollection({
					...currentCollection,
					is_public: collection.is_public,
					publish_at: collection.publish_at,
				});
			}
			if (initialCollection) {
				setInitialCollection({
					...initialCollection,
					is_public: collection.is_public,
					publish_at: collection.publish_at,
				});
			}
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
		if (currentCollection) {
			switch (currentTab) {
				case 'inhoud':
					return (
						<CollectionOrBundleEditContent
							type={type}
							collection={currentCollection}
							swapFragments={swapFragments}
							updateCollection={setCurrentCollection}
							onFragmentChanged={onFragmentChanged}
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
							collection={currentCollection}
							updateCollectionProperty={updateCollectionProperty}
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
				isCollection ? 'Collectie hernoemen' : t('Bundel hernoemen'),
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
						!eq(currentCollection, initialCollection)
							? t('U moet uw wijzigingen eerst opslaan')
							: ''
					}
					onClick={() => setIsShareModalOpen(!isShareModalOpen)}
				/>
				<Button
					type="secondary"
					label={t('Bekijk')}
					title={
						isCollection
							? t('Bekijk hoe de collectie er zal uit zien')
							: t('Bekijk hoe de bundel er zal uit zien')
					}
					onClick={() =>
						redirectToClientPage(
							buildLink(isCollection ? APP_PATH.COLLECTION_DETAIL : APP_PATH.BUNDLE_DETAIL, {
								id: match.params.id,
							}),
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
						<MenuContent menuItems={COLLECTION_DROPDOWN_ITEMS} onClick={onClickDropdownItem} />
					</DropdownContent>
				</ControlledDropdown>
				<Spacer margin="left-small">{renderSaveButton()}</Spacer>
			</ButtonToolbar>
		);
	};

	const renderCollectionOrBundleEdit = () => {
		const { profile, title } = currentCollection as Avo.Collection.Collection;

		return (
			<>
				<Prompt
					when={hasUnsavedChanged()}
					message={t(
						'Er zijn nog niet opgeslagen wijzigingen, weet u zeker dat u de pagina wil verlaten?'
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
					<HeaderAvatar>{profile && renderAvatar(profile, { includeRole: true })}</HeaderAvatar>
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
					collection={currentCollection as Avo.Collection.Collection}
					isOpen={isShareModalOpen}
					onClose={onCloseShareCollectionModal}
					setIsPublic={(value: boolean) => updateCollectionProperty(value, 'is_public')}
					history={history}
					match={match}
					user={user}
					{...rest}
				/>
				<DeleteObjectModal
					title={
						isCollection
							? t('Ben je zeker dat je deze collectie wil verwijderen?')
							: t('Ben je zeker dat je deze bundel wil verwijderen')
					}
					body={t('Deze actie kan niet ongedaan gemaakt worden')}
					isOpen={isDeleteModalOpen}
					onClose={() => setIsDeleteModalOpen(false)}
					deleteObjectCallback={onDeleteCollection}
				/>
				<InputModal
					title={
						isCollection
							? t('collection/views/collection-edit___hernoem-deze-collectie')
							: t('Hernoem deze bundel')
					}
					inputLabel={isCollection ? t('Naam collectie:') : t('Naam bundel:')}
					inputValue={title}
					isOpen={isRenameModalOpen}
					onClose={() => setIsRenameModalOpen(false)}
					inputCallback={onRenameCollection}
					emptyMessage={
						isCollection
							? t('Gelieve een collectie titel in te vullen.')
							: t('Gelieve een bundel titel in te vullen')
					}
				/>
			</>
		);
	};

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={currentCollection}
			render={renderCollectionOrBundleEdit}
		/>
	);
};

const mapStateToProps = (state: AppState) => ({
	user: selectUser(state),
});

export default withRouter(connect(mapStateToProps)(CollectionOrBundleEdit));
