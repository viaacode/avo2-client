import { Button, ButtonToolbar, IconName, type TagInfo } from '@viaa/avo2-components';
import { type Avo } from '@viaa/avo2-types';
import { compact, partition } from 'lodash-es';
import React, {
	type FunctionComponent,
	type ReactNode,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { ASSIGNMENT_CREATE_UPDATE_TABS } from '../../../assignment/assignment.const';
import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId } from '../../../authentication/helpers/get-profile-id';
import { CollectionService } from '../../../collection/collection.service';
import { useGetCollectionsEditStatuses } from '../../../collection/hooks/useGetCollectionsEditStatuses';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	type CheckboxOption,
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components';
import { CollectionOrBundleOrAssignmentTitleAndCopyTag } from '../../../shared/components/CollectionOrBundleOrAssignmentTitleAndCopyTag/CollectionOrBundleOrAssignmentTitleAndCopyTag';
import { EDIT_STATUS_REFETCH_TIME } from '../../../shared/constants';
import { buildLink, CustomError, getFullName } from '../../../shared/helpers';
import { isContentBeingEdited } from '../../../shared/helpers/is-content-being-edited';
import { useCompaniesWithUsers } from '../../../shared/hooks/useCompanies';
import { useLomEducationLevels } from '../../../shared/hooks/useLomEducationLevels';
import { useLomSubjects } from '../../../shared/hooks/useLomSubjects';
import { useQualityLabels } from '../../../shared/hooks/useQualityLabels';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import AddOrRemoveLinkedElementsModal, {
	type AddOrRemove,
} from '../../shared/components/AddOrRemoveLinkedElementsModal/AddOrRemoveLinkedElementsModal';
import ChangeAuthorModal from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import FilterTable, {
	type FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import SubjectsBeingEditedWarningModal from '../../shared/components/SubjectsBeingEditedWarningModal/SubjectsBeingEditedWarningModal';
import { NULL_FILTER } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { type PickerItem } from '../../shared/types';
import { useUserGroups } from '../../user-groups/hooks/useUserGroups';
import {
	COLLECTIONS_OR_BUNDLES_PATH,
	GET_COLLECTION_BULK_ACTIONS,
	GET_COLLECTIONS_COLUMNS,
	ITEMS_PER_PAGE,
} from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	type CollectionsBulkAction,
	type CollectionsOrBundlesOverviewTableCols,
	type CollectionsOrBundlesTableState,
} from '../collections-or-bundles.types';
import { generateCollectionWhereObject } from '../helpers/collection-filters';
import { renderCollectionOverviewColumns } from '../helpers/render-collection-columns';

type CollectionsOrBundlesOverviewProps = DefaultSecureRouteProps;

const CollectionsOrBundlesOverview: FunctionComponent<CollectionsOrBundlesOverviewProps> = ({
	location,
	user,
}) => {
	const { tText, tHtml } = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<CollectionsOrBundlesTableState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const { data: editStatuses } = useGetCollectionsEditStatuses(
		collections?.map((coll) => coll.id) || [],
		{
			enabled: !!collections?.length,
			refetchInterval: EDIT_STATUS_REFETCH_TIME,
			refetchIntervalInBackground: true,
		}
	);

	const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

	const [changeAuthorModalOpen, setChangeAuthorModalOpen] = useState<boolean>(false);

	const [changeLabelsModalOpen, setAddLabelModalOpen] = useState<boolean>(false);

	const [userGroups] = useUserGroups(false);
	const [subjects] = useLomSubjects();
	const [educationLevels] = useLomEducationLevels();
	const [collectionLabels] = useQualityLabels(true);
	const [organisations] = useCompaniesWithUsers();
	const [collectionsBeingEdited, setCollectionsBeingEdited] = useState<Avo.Share.EditStatus[]>(
		[]
	);
	const [selectedBulkAction, setSelectedBulkAction] = useState<CollectionsBulkAction | null>(
		null
	);

	// computed

	const userGroupOptions = useMemo(() => {
		return [
			...userGroups.map(
				(option): CheckboxOption => ({
					id: String(option.id),
					label: option.label as string,
					checked: (tableState?.author_user_group || ([] as string[])).includes(
						String(option.id)
					),
				})
			),
			{
				id: NULL_FILTER,
				label: tText('admin/collections-or-bundles/views/collection-or-bundle___geen-rol'),
				checked: ((tableState?.author_user_group || []) as string[]).includes(NULL_FILTER),
			},
		];
	}, [tableState, userGroups, tText]);

	const collectionLabelOptions = useMemo(
		() => [
			{
				id: NULL_FILTER,
				label: tText(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___geen-label'
				),
				checked: ((tableState?.collection_labels || []) as string[]).includes(NULL_FILTER),
			},
			...collectionLabels.map(
				(option): CheckboxOption => ({
					id: String(option.value),
					label: option.description,
					checked: ((tableState?.collection_labels || []) as string[]).includes(
						String(option.value)
					),
				})
			),
		],
		[collectionLabels, tText, tableState]
	);

	const organisationOptions = useMemo(
		() => [
			{
				id: NULL_FILTER,
				label: tText(
					'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___geen-organisatie'
				),
				checked: ((tableState?.organisation || []) as string[]).includes(NULL_FILTER),
			},
			...organisations.map(
				(option): CheckboxOption => ({
					id: String(option.or_id),
					label: option.name,
					checked: ((tableState?.organisation || []) as string[]).includes(
						String(option.or_id)
					),
				})
			),
		],
		[organisations, tText, tableState]
	);

	const isCollection = location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW;
	const tableColumns = useMemo(
		() =>
			GET_COLLECTIONS_COLUMNS(
				isCollection,
				userGroupOptions,
				collectionLabelOptions,
				subjects,
				educationLevels,
				organisationOptions
			),
		[
			collectionLabelOptions,
			educationLevels,
			isCollection,
			subjects,
			userGroupOptions,
			organisationOptions,
		]
	);

	// methods
	const generateWhereObject = useCallback(
		(filters: Partial<CollectionsOrBundlesTableState>) => {
			const andFilters: any[] = generateCollectionWhereObject(
				filters,
				user,
				isCollection,
				false,
				true,
				'collectionTable'
			);

			return { _and: andFilters };
		},
		[isCollection, user]
	);

	const fetchCollectionsOrBundles = useCallback(async () => {
		setIsLoading(true);

		try {
			const column = tableColumns.find(
				(tableColumn: FilterableColumn) => tableColumn.id === tableState.sort_column
			);
			const columnDataType = (column?.dataType ||
				TableColumnDataType.string) as TableColumnDataType;
			const [collectionsTemp, collectionsCountTemp] =
				await CollectionsOrBundlesService.getCollections(
					tableState.page || 0,
					(tableState.sort_column ||
						'created_at') as CollectionsOrBundlesOverviewTableCols,
					tableState.sort_order || 'desc',
					columnDataType,
					generateWhereObject(getFilters(tableState))
				);

			setCollections(collectionsTemp);
			setCollectionCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get collections from the database', err, { tableState })
			);

			setLoadingInfo({
				state: 'error',
				message: isCollection
					? tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-collecties-is-mislukt'
					  )
					: tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-bundels-is-mislukt'
					  ),
			});
		}

		setIsLoading(false);
	}, [tableColumns, tableState, generateWhereObject, isCollection, tText]);

	useEffect(() => {
		fetchCollectionsOrBundles();
	}, [fetchCollectionsOrBundles]);

	useEffect(() => {
		if (collections) {
			setLoadingInfo({
				state: 'loaded',
			});
		}

		// Update selected rows to always be a subset of the collections array
		// In other words, you cannot have something selected that isn't part of the current filtered/paginated results
		const collectionIds: string[] = (collections || []).map((coll) => coll.id);

		setSelectedCollectionIds((currentSelectedCollectionIds) => {
			return (currentSelectedCollectionIds || []).filter(
				(collId) => collId && collectionIds.includes(collId)
			);
		});
	}, [setLoadingInfo, collections, setSelectedCollectionIds]);

	const setAllCollectionsAsSelected = async () => {
		setIsLoading(true);

		try {
			const collectionIds = await CollectionsOrBundlesService.getCollectionIds(
				generateWhereObject(getFilters(tableState))
			);
			ToastService.info(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___je-hebt-num-of-selected-collections-collecties-geselecteerd',
					{
						numOfSelectedCollections: collectionIds.length,
					}
				)
			);

			setSelectedCollectionIds(collectionIds);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to get all collection ids that match the selected filter',
					err,
					{ tableState }
				)
			);

			ToastService.danger(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-collectie-ids-is-mislukt'
				)
			);
		}

		setIsLoading(false);
	};

	const handleBulkAction = async (action: CollectionsBulkAction): Promise<void> => {
		if (!selectedCollectionIds || !selectedCollectionIds.length) {
			return;
		}

		const selectedCollectionEditStatuses =
			await CollectionService.getCollectionsEditStatuses(selectedCollectionIds);
		const partitionedCollectionIds = partition(
			Object.entries(selectedCollectionEditStatuses),
			(entry) => !!entry[1]
		);
		const selectedCollectionsThatAreBeingEdited: Avo.Share.EditStatus[] =
			partitionedCollectionIds[0].map((entry) => entry[1]);
		const selectedCollectionIdsThatAreNotBeingEdited = partitionedCollectionIds[1].map(
			(entry) => entry[0]
		);

		if (selectedCollectionsThatAreBeingEdited.length > 0) {
			// open warning modal first
			setSelectedCollectionIds(selectedCollectionIdsThatAreNotBeingEdited);
			setSelectedBulkAction(action);
			setCollectionsBeingEdited(selectedCollectionsThatAreBeingEdited);
		} else {
			// execute action straight away
			setCollectionsBeingEdited([]);
			setSelectedBulkAction(null);

			switch (action) {
				case 'publish':
					await bulkChangePublishStateForSelectedCollections(true);
					return;

				case 'depublish':
					await bulkChangePublishStateForSelectedCollections(false);
					return;

				case 'delete':
					await bulkDeleteSelectedCollections();
					return;

				case 'change_author':
					setChangeAuthorModalOpen(true);
					return;

				case 'change_labels':
					setAddLabelModalOpen(true);
					return;
			}
		}
	};

	const bulkChangePublishStateForSelectedCollections = async (isPublic: boolean) => {
		try {
			if (!selectedCollectionIds || !selectedCollectionIds.length) {
				return;
			}

			await CollectionsOrBundlesService.bulkChangePublicStateForCollections(
				isPublic,
				compact(selectedCollectionIds),
				getProfileId(user)
			);

			ToastService.success(
				isPublic
					? tHtml(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___de-geselecteerde-collecties-zijn-gepubliceerd'
					  )
					: tHtml(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___de-geselecteerde-collecties-zijn-gedepubliceerd'
					  )
			);

			await fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle publish state for collections', err, {
					isPublic,
					selectedRows: selectedCollectionIds,
				})
			);

			ToastService.danger(
				isPublic
					? tHtml(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-publiceren-van-de-collecties-is-mislukt'
					  )
					: tHtml(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-depubliceren-van-de-collecties-is-mislukt'
					  )
			);
		}
	};

	const bulkDeleteSelectedCollections = async () => {
		try {
			if (!selectedCollectionIds || !selectedCollectionIds.length) {
				return;
			}

			await CollectionsOrBundlesService.bulkDeleteCollections(
				compact(selectedCollectionIds),
				getProfileId(user)
			);

			ToastService.success(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___de-geselecteerde-collecties-zijn-verwijderd'
				)
			);

			await fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk delete collections', err, {
					selectedRows: selectedCollectionIds,
				})
			);

			ToastService.danger(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-verwijderen-van-de-collecties-is-mislukt'
				)
			);
		}
	};

	const bulkChangeAuthor = async (authorProfileId: string) => {
		try {
			if (!selectedCollectionIds || !selectedCollectionIds.length) {
				return;
			}

			await CollectionsOrBundlesService.bulkUpdateAuthorForCollections(
				authorProfileId,
				compact(selectedCollectionIds),
				getProfileId(user)
			);

			ToastService.success(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___de-auteurs-zijn-aangepast-voor-de-geselecteerde-collecties'
				)
			);

			await fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk update author for collections', err, {
					authorProfileId,
				})
			);

			ToastService.danger(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-aanpassen-van-de-auteurs-is-mislukt'
				)
			);
		}
	};

	const bulkChangeLabels = async (addOrRemove: AddOrRemove, labels: string[]) => {
		try {
			if (!selectedCollectionIds || !selectedCollectionIds.length) {
				return;
			}

			if (addOrRemove === 'add') {
				await CollectionsOrBundlesService.bulkAddLabelsToCollections(
					labels,
					compact(selectedCollectionIds),
					getProfileId(user)
				);

				ToastService.success(
					tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-toegevoegd-aan-de-geselecteerde-collecties'
					)
				);
			} else {
				// remove
				await CollectionsOrBundlesService.bulkRemoveLabelsFromCollections(
					labels,
					compact(selectedCollectionIds),
					getProfileId(user)
				);
				ToastService.success(
					tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-verwijderd-van-de-geselecteerde-collecties'
					)
				);
			}

			await fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk update labels of collections', err, {
					addOrRemove,
					labels,
				})
			);

			ToastService.danger(
				tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-aanpassen-van-de-labels-is-mislukt'
				)
			);
		}
	};

	const renderTableCell = (
		collectionOrBundle: Partial<Avo.Collection.Collection>,
		columnId: CollectionsOrBundlesOverviewTableCols
	) => {
		const editLink = buildLink(
			isCollection ? APP_PATH.COLLECTION_EDIT_TAB.route : APP_PATH.BUNDLE_EDIT_TAB.route,
			{
				id: collectionOrBundle.id,
				tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
			}
		);
		const editLinkOriginal = collectionOrBundle.relations?.[0].object
			? buildLink(
					isCollection
						? APP_PATH.COLLECTION_EDIT_TAB.route
						: APP_PATH.BUNDLE_EDIT_TAB.route,
					{
						id: collectionOrBundle.relations?.[0].object,
						tabId: ASSIGNMENT_CREATE_UPDATE_TABS.CONTENT,
					}
			  )
			: null;

		switch (columnId) {
			case 'title': {
				return (
					<CollectionOrBundleOrAssignmentTitleAndCopyTag
						title={collectionOrBundle.title}
						editLink={editLink}
						editLinkOriginal={editLinkOriginal}
					/>
				);
			}

			case 'actions': {
				if (!editStatuses) {
					return null;
				}
				const isCollectionBeingEdited = isContentBeingEdited(
					editStatuses?.[collectionOrBundle.id as string],
					user.profile?.id
				);
				const viewButtonTitle = isCollection
					? tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-collectie'
					  )
					: tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-bundel'
					  );
				const editButtonTitle = isCollectionBeingEdited
					? tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-wordt-reeds-bewerkt-door-iemand-anders'
					  )
					: isCollection
					? tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
					  )
					: tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
					  );
				return (
					<ButtonToolbar>
						<Link
							to={buildLink(
								isCollection
									? APP_PATH.COLLECTION_DETAIL.route
									: APP_PATH.BUNDLE_DETAIL.route,
								{
									id: collectionOrBundle.id,
								}
							)}
						>
							<Button
								type="secondary"
								icon={IconName.eye}
								ariaLabel={viewButtonTitle}
								title={viewButtonTitle}
							/>
						</Link>

						{isCollectionBeingEdited ? (
							<Button
								type="secondary"
								icon={IconName.edit}
								ariaLabel={editButtonTitle}
								title={editButtonTitle}
								disabled={true}
							/>
						) : (
							<Link to={editLink}>
								<Button
									type="secondary"
									icon={IconName.edit}
									ariaLabel={editButtonTitle}
									title={editButtonTitle}
								/>
							</Link>
						)}
					</ButtonToolbar>
				);
			}

			default:
				return renderCollectionOverviewColumns(
					collectionOrBundle,
					columnId,
					collectionLabels
				);
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={tHtml(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___er-bestaan-nog-geen-collecties'
				)}
			>
				<p>
					{tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___beschrijving-wanneer-er-nog-geen-collecties-zijn'
					)}
				</p>
			</ErrorView>
		);
	};

	const renderCollectionsOrBundlesOverview = () => {
		if (!collections) {
			return null;
		}

		return (
			<>
				<FilterTable
					columns={tableColumns}
					data={collections}
					dataCount={collectionCount}
					renderCell={renderTableCell as any}
					searchTextPlaceholder={tText(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___zoek-op-titel-beschrijving-auteur'
					)}
					noContentMatchingFiltersMessage={
						isCollection
							? tText(
									'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-collecties-doe-voldoen-aan-de-opgegeven-filters'
							  )
							: tText(
									'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-bundels-doe-voldoen-aan-de-opgegeven-filters'
							  )
					}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="id"
					bulkActions={GET_COLLECTION_BULK_ACTIONS()}
					onSelectBulkAction={handleBulkAction as any}
					selectedItemIds={selectedCollectionIds}
					onSelectionChanged={setSelectedCollectionIds as (ids: ReactNode[]) => void}
					onSelectAll={setAllCollectionsAsSelected}
					isLoading={isLoading}
				/>
				<SubjectsBeingEditedWarningModal
					isOpen={collectionsBeingEdited?.length > 0}
					onClose={() => {
						setCollectionsBeingEdited([]);
						setSelectedBulkAction(null);
					}}
					confirmCallback={async () => {
						setCollectionsBeingEdited([]);
						if (selectedCollectionIds.length > 0) {
							await handleBulkAction(selectedBulkAction as CollectionsBulkAction);
						} else {
							ToastService.info(
								tHtml(
									'admin/collections-or-bundles/views/collections-or-bundles-overview___alle-geselecteerde-collecties-worden-bewerkt-dus-de-actie-kan-niet-worden-uitgevoerd'
								)
							);
						}
					}}
					title={tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___enkele-collecties-worden-bewerkt'
					)}
					editWarningSection1={tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collecties-worden-momenteel-bewerkt'
					)}
					editWarningSection2={tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___je-kan-doorgaan-met-je-actie-maar-deze-collecties-zullen-niet-behandeld-worden'
					)}
					subjects={collectionsBeingEdited}
					route={APP_PATH.COLLECTION_DETAIL.route}
				/>
				<ChangeAuthorModal
					isOpen={changeAuthorModalOpen}
					onClose={() => setChangeAuthorModalOpen(false)}
					callback={(newAuthor: PickerItem) => bulkChangeAuthor(newAuthor.value)}
					initialAuthor={{
						label: getFullName(
							user as { profile: Avo.User.Profile },
							true,
							false
						) as string,
						value: getProfileId(user),
						type: 'PROFILE',
					}}
				/>
				<AddOrRemoveLinkedElementsModal
					title={tHtml(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-aanpassen'
					)}
					addOrRemoveLabel={tText(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-toevoegen-of-verwijderen'
					)}
					contentLabel={tText(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___labels'
					)}
					isOpen={changeLabelsModalOpen}
					onClose={() => setAddLabelModalOpen(false)}
					labels={collectionLabels.map((labelObj) => ({
						label: labelObj.description,
						value: labelObj.value,
					}))}
					callback={(addOrRemove: AddOrRemove, labels: TagInfo[]) =>
						bulkChangeLabels(
							addOrRemove,
							labels.map((labelObj) => labelObj.value.toString())
						)
					}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={
				isCollection
					? tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___collecties'
					  )
					: tText(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___bundels'
					  )
			}
			size="full-width"
		>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							isCollection
								? tText(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-titel'
								  )
								: tText(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-titel'
								  )
						)}
					</title>
					<meta
						name="description"
						content={
							isCollection
								? tText(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-beschrijving'
								  )
								: tText(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-beschrijving'
								  )
						}
					/>
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={collections}
					render={renderCollectionsOrBundlesOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default CollectionsOrBundlesOverview;
