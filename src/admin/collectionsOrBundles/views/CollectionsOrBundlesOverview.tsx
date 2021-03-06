import { compact, get, truncate } from 'lodash-es';
import React, {
	FunctionComponent,
	ReactText,
	useCallback,
	useEffect,
	useMemo,
	useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, TagInfo, TagList } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { getProfileId } from '../../../authentication/helpers/get-profile-id';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	CheckboxOption,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { buildLink, CustomError, getFullName } from '../../../shared/helpers';
import { useEducationLevels, useSubjects } from '../../../shared/hooks';
import { useCollectionQualityLabels } from '../../../shared/hooks/useCollectionQualityLabels';
import { ToastService } from '../../../shared/services';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import AddOrRemoveLinkedElementsModal, {
	AddOrRemove,
} from '../../shared/components/AddOrRemoveLinkedElementsModal/AddOrRemoveLinkedElementsModal';
import ChangeAuthorModal from '../../shared/components/ChangeAuthorModal/ChangeAuthorModal';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { PickerItem } from '../../shared/types';
import { useUserGroups } from '../../user-groups/hooks';
import {
	COLLECTIONS_OR_BUNDLES_PATH,
	GET_COLLECTIONS_COLUMNS,
	GET_COLLECTION_BULK_ACTIONS,
} from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	CollectionBulkAction,
	CollectionsOrBundlesOverviewTableCols,
	CollectionsOrBundlesTableState,
} from '../collections-or-bundles.types';
import { generateCollectionWhereObject } from '../helpers/collection-filters';
import { renderCollectionOverviewColumns } from '../helpers/render-collection-columns';

interface CollectionsOrBundlesOverviewProps extends DefaultSecureRouteProps {}

const CollectionsOrBundlesOverview: FunctionComponent<CollectionsOrBundlesOverviewProps> = ({
	history,
	location,
	user,
}) => {
	const [t] = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<CollectionsOrBundlesTableState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

	const [changeAuthorModalOpen, setChangeAuthorModalOpen] = useState<boolean>(false);

	const [changeLabelsModalOpen, setAddLabelModalOpen] = useState<boolean>(false);

	const [userGroups] = useUserGroups(false);
	const [subjects] = useSubjects();
	const [educationLevels] = useEducationLevels();
	const [collectionLabels] = useCollectionQualityLabels();

	// computed
	const userGroupOptions = useMemo(
		() =>
			userGroups.map(
				(option): CheckboxOption => ({
					id: String(option.id),
					label: option.label as string,
					checked: get(tableState, 'author.user_groups', [] as string[]).includes(
						String(option.id)
					),
				})
			),
		[tableState, userGroups]
	);
	const collectionLabelOptions = useMemo(
		() => [
			{
				id: NULL_FILTER,
				label: t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___geen-label'
				),
				checked: get(tableState, 'collection_labels', [] as string[]).includes(NULL_FILTER),
			},
			...collectionLabels.map(
				(option): CheckboxOption => ({
					id: String(option.value),
					label: option.description,
					checked: get(tableState, 'collection_labels', [] as string[]).includes(
						String(option.value)
					),
				})
			),
		],
		[collectionLabels, t, tableState]
	);
	const isCollection = location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW;
	const tableColumns = useMemo(
		() =>
			GET_COLLECTIONS_COLUMNS(
				isCollection,
				userGroupOptions,
				collectionLabelOptions,
				subjects,
				educationLevels
			),
		[collectionLabelOptions, educationLevels, isCollection, subjects, userGroupOptions]
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
			const columnDataType: string = get(column, 'dataType', '');
			const [
				collectionsTemp,
				collectionsCountTemp,
			] = await CollectionsOrBundlesService.getCollections(
				tableState.page || 0,
				(tableState.sort_column || 'created_at') as CollectionsOrBundlesOverviewTableCols,
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
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-collecties-is-mislukt'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-bundels-is-mislukt'
					  ),
			});
		}

		setIsLoading(false);
	}, [tableColumns, tableState, generateWhereObject, isCollection, t]);

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
				t(
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

			ToastService.danger('Het ophalen van de collectie ids is mislukt');
		}

		setIsLoading(false);
	};

	const navigateToCollectionDetail = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(
				isCollection
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-heeft-geen-geldig-id'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-bundel-heeft-geen-geldig-id'
					  )
			);
			return;
		}

		const detailRoute = isCollection
			? APP_PATH.COLLECTION_DETAIL.route
			: APP_PATH.BUNDLE_DETAIL.route;
		redirectToClientPage(buildLink(detailRoute, { id }), history);
	};

	const handleBulkActionSelect = async (action: CollectionBulkAction): Promise<void> => {
		if (!selectedCollectionIds || !selectedCollectionIds.length) {
			return;
		}

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
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___de-gegeselecterde-collecties-zijn-gepubliceerd'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___de-gegeselecterde-collecties-zijn-gedepubliceerd'
					  )
			);

			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to toggle publish state for collections', err, {
					isPublic,
					selectedRows: selectedCollectionIds,
				})
			);

			ToastService.danger(
				isPublic
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-publiceren-van-de-collecties-is-mislukt'
					  )
					: t(
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
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___de-gegeselecterde-collecties-zijn-verwijderd'
				)
			);

			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk delete collections', err, {
					selectedRows: selectedCollectionIds,
				})
			);

			ToastService.danger(
				t(
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
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___de-auteurs-zijn-aangepast-voor-de-geselecterde-collecties'
				)
			);

			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk update author for collections', err, {
					authorProfileId,
				})
			);

			ToastService.danger(
				t(
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
					t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-toegevoegd-aan-de-geslecteerde-collecties'
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
					t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___de-labels-zijn-verwijderd-van-de-geslecteerde-collecties'
					)
				);
			}

			fetchCollectionsOrBundles();
		} catch (err) {
			console.error(
				new CustomError('Failed to bulk update labels of collections', err, {
					addOrRemove,
					labels,
				})
			);

			ToastService.danger(
				t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___het-aanpassen-van-de-labels-is-mislukt'
				)
			);
		}
	};

	const navigateToCollectionEdit = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(
				isCollection
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-heeft-geen-geldig-id'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-bundel-heeft-geen-geldig-id'
					  )
			);

			return;
		}

		const detailRoute = isCollection
			? APP_PATH.COLLECTION_EDIT.route
			: APP_PATH.BUNDLE_EDIT.route;
		const link = buildLink(detailRoute, { id });

		redirectToClientPage(link, history);
	};

	const renderTableCell = (
		rowData: Partial<Avo.Collection.Collection>,
		columnId: CollectionsOrBundlesOverviewTableCols
	) => {
		switch (columnId) {
			case 'title':
				const title = truncate((rowData as any)[columnId] || '-', { length: 50 });

				return (
					<Link
						to={buildLink(
							isCollection
								? APP_PATH.COLLECTION_EDIT.route
								: APP_PATH.BUNDLE_EDIT.route,
							{ id: rowData.id }
						)}
					>
						<span>{title}</span>
						{!!get(rowData, 'relations[0].object') && (
							<a
								href={buildLink(APP_PATH.COLLECTION_DETAIL.route, {
									id: get(rowData, 'relations[0].object'),
								})}
							>
								<TagList
									tags={[
										{ id: get(rowData, 'relations[0].object'), label: 'Kopie' },
									]}
									swatches={false}
								/>
							</a>
						)}
					</Link>
				);

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							type="secondary"
							icon="eye"
							onClick={() => navigateToCollectionDetail(rowData.id)}
							ariaLabel={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-bundel'
									  )
							}
							title={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bekijk-de-bundel'
									  )
							}
						/>
						<Button
							type="secondary"
							icon="edit"
							onClick={() => navigateToCollectionEdit(rowData.id)}
							ariaLabel={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
									  )
							}
							title={
								isCollection
									? t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-collectie'
									  )
									: t(
											'admin/collections-or-bundles/views/collections-or-bundles-overview___bewerk-de-bundel'
									  )
							}
						/>
					</ButtonToolbar>
				);

			default:
				return renderCollectionOverviewColumns(rowData, columnId, collectionLabels);
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={t(
					'admin/collections-or-bundles/views/collections-or-bundles-overview___er-bestaan-nog-geen-collecties'
				)}
			>
				<p>
					<Trans i18nKey="admin/collections-or-bundles/views/collections-or-bundles-overview___beschrijving-wanneer-er-nog-geen-collecties-zijn">
						Beschrijving wanneer er nog geen collecties zijn
					</Trans>
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
					searchTextPlaceholder={t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___zoek-op-titel-beschrijving-auteur'
					)}
					noContentMatchingFiltersMessage={
						isCollection
							? t(
									'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-collecties-doe-voldoen-aan-de-opgegeven-filters'
							  )
							: t(
									'admin/collections-or-bundles/views/collections-or-bundles-overview___er-zijn-geen-bundels-doe-voldoen-aan-de-opgegeven-filters'
							  )
					}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="id"
					bulkActions={GET_COLLECTION_BULK_ACTIONS()}
					onSelectBulkAction={handleBulkActionSelect as any}
					selectedItemIds={selectedCollectionIds}
					onSelectionChanged={setSelectedCollectionIds as (ids: ReactText[]) => void}
					onSelectAll={setAllCollectionsAsSelected}
					isLoading={isLoading}
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
					title={t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-aanpassen'
					)}
					addOrRemoveLabel={t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___labels-toevoegen-of-verwijderen'
					)}
					contentLabel={t(
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
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___collecties'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___bundels'
					  )
			}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							isCollection
								? t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-titel'
								  )
								: t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-titel'
								  )
						)}
					</title>
					<meta
						name="description"
						content={
							isCollection
								? t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___collectie-beheer-overview-pagina-beschrijving'
								  )
								: t(
										'admin/collections-or-bundles/views/collections-or-bundles-overview___bundel-beheer-overview-pagina-beschrijving'
								  )
						}
					/>
				</MetaTags>
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
