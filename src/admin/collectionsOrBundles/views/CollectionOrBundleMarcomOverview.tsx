import { ExportAllToCsvModal } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { type Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import {
	GET_MARCOM_CHANNEL_NAME_OPTIONS,
	GET_MARCOM_CHANNEL_TYPE_OPTIONS,
} from '../../../collection/collection.const';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	type CheckboxOption,
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components';
import { CustomError } from '../../../shared/helpers';
import { tableColumnListToCsvColumnList } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import withUser from '../../../shared/hocs/withUser';
import { useCompaniesWithUsers } from '../../../shared/hooks/useCompanies';
import { useLomEducationLevelsAndDegrees } from '../../../shared/hooks/useLomEducationLevelsAndDegrees';
import { useLomSubjects } from '../../../shared/hooks/useLomSubjects';
import { useQualityLabels } from '../../../shared/hooks/useQualityLabels';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import FilterTable, {
	type FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import { NULL_FILTER } from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { useUserGroups } from '../../user-groups/hooks/useUserGroups';
import {
	COLLECTIONS_OR_BUNDLES_PATH,
	GET_COLLECTION_MARCOM_COLUMNS,
	ITEMS_PER_PAGE,
} from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	CollectionBulkAction,
	type CollectionOrBundleMarcomOverviewTableCols,
	type CollectionOrBundleMarcomTableState,
	type CollectionSortProps,
	EditorialType,
} from '../collections-or-bundles.types';
import {
	renderCollectionsOrBundlesMarcomTableCellReact,
	renderCollectionsOrBundlesMarcomTableCellText,
} from '../helpers/render-collection-columns';

const CollectionOrBundleMarcomOverview: FC<DefaultSecureRouteProps> = ({
	location,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<CollectionOrBundleMarcomTableState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] = useState(false);

	const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

	const [userGroups] = useUserGroups(false);
	const [subjects] = useLomSubjects();
	const { data: educationLevelsAndDegrees } = useLomEducationLevelsAndDegrees();
	const [collectionLabels] = useQualityLabels(true);
	const [organisations] = useCompaniesWithUsers();

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

	const channelNameOptions = useMemo(() => {
		const options = GET_MARCOM_CHANNEL_NAME_OPTIONS().map((option) => ({
			id: option.value,
			label: option.label,
			checked: (tableState?.marcom_last_communication_channel_name || []).includes(
				option.value
			),
		}));
		return [
			{
				id: NULL_FILTER,
				label: tText(
					'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___geen-kanaal'
				),
				checked: (tableState?.marcom_last_communication_channel_name || []).includes(
					NULL_FILTER
				),
			},
			...options,
		];
	}, [tText, tableState?.marcom_last_communication_channel_name]);

	const channelTypeOptions = useMemo(
		() => [
			...GET_MARCOM_CHANNEL_TYPE_OPTIONS().map((option) => ({
				id: option.value,
				label: option.label,
				checked: (tableState?.marcom_last_communication_channel_type || []).includes(
					option.value
				),
			})),
		],
		[tableState]
	);

	const tableColumns = useMemo(
		() =>
			GET_COLLECTION_MARCOM_COLUMNS(
				userGroupOptions,
				collectionLabelOptions,
				channelNameOptions,
				subjects,
				educationLevelsAndDegrees || [],
				organisationOptions,
				channelTypeOptions
			),
		[
			userGroupOptions,
			collectionLabelOptions,
			channelNameOptions,
			subjects,
			educationLevelsAndDegrees,
			organisationOptions,
			channelTypeOptions,
		]
	);
	const isCollection =
		location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_MARCOM_OVERVIEW;

	// methods
	const getColumnDataType = useCallback(() => {
		const column = tableColumns.find(
			(tableColumn: FilterableColumn) => tableColumn.id === tableState.sort_column
		);
		return (column?.dataType || TableColumnDataType.string) as TableColumnDataType;
	}, [tableColumns, tableState.sort_column]);

	const fetchCollectionsOrBundles = useCallback(async () => {
		setIsLoading(true);

		try {
			const { collections: collectionsTemp, total: collectionsCountTemp } =
				await CollectionsOrBundlesService.getCollectionEditorial(
					(tableState.page || 0) * ITEMS_PER_PAGE,
					ITEMS_PER_PAGE,
					(tableState.sort_column || 'updated_at') as CollectionSortProps,
					tableState.sort_order || 'desc',
					getFilters(tableState),
					EditorialType.MARCOM,
					isCollection,
					true
				);
			setCollections(collectionsTemp);
			setCollectionCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get collection marcom entries from the database', err, {
					tableState,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? tText(
							'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___het-ophalen-van-de-collectie-actualisaties-is-mislukt'
					  )
					: tText(
							'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___het-ophalen-van-de-bundel-actualisaties-is-mislukt'
					  ),
			});
		}
		setIsLoading(false);
	}, [tableState, getColumnDataType, isCollection, tText]);

	useEffect(() => {
		if (commonUser && educationLevelsAndDegrees?.length) {
			fetchCollectionsOrBundles().then(noop);
		}
	}, [fetchCollectionsOrBundles, commonUser, educationLevelsAndDegrees]);

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
				getFilters(tableState),
				isCollection
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
					'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___het-ophalen-van-de-collectie-ids-is-mislukt'
				)
			);
		}
		setIsLoading(false);
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

	const renderCollectionOrBundleMarcomOverview = () => {
		if (!collections) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={tableColumns}
					data={collections}
					dataCount={collectionCount}
					renderCell={(collectionOrBundle: any, columnId: string) =>
						renderCollectionsOrBundlesMarcomTableCellReact(
							collectionOrBundle as Partial<Avo.Collection.Collection>,
							columnId as CollectionOrBundleMarcomOverviewTableCols,
							{
								isCollection,
								collectionLabels,
							}
						)
					}
					searchTextPlaceholder={tText(
						'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___zoek-op-titel-beschrijving-auteur'
					)}
					noContentMatchingFiltersMessage={
						isCollection
							? tText(
									'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___er-zijn-geen-collectie-marcom-items-die-voldoen-aan-de-opgegeven-filters'
							  )
							: tText(
									'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___er-zijn-geen-collectie-marcom-items-die-voldoen-aan-de-opgegeven-filters'
							  )
					}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="id"
					selectedItemIds={selectedCollectionIds}
					onSelectionChanged={setSelectedCollectionIds as (ids: ReactNode[]) => void}
					onSelectAll={setAllCollectionsAsSelected}
					isLoading={isLoading}
					showCheckboxes={true}
					bulkActions={[
						{
							label: tText(
								'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___exporteer-alles'
							),
							value: CollectionBulkAction.EXPORT_ALL,
						},
					]}
					onSelectBulkAction={async (action: string) => {
						if (action === CollectionBulkAction.EXPORT_ALL) {
							setIsExportAllToCsvModalOpen(true);
						}
					}}
				/>
				<ExportAllToCsvModal
					title={
						isCollection
							? tText(
									'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___exporteren-van-alle-collecties-naar-csv'
							  )
							: tText(
									'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___exporteren-van-alle-bundels-naar-csv'
							  )
					}
					isOpen={isExportAllToCsvModalOpen}
					onClose={() => setIsExportAllToCsvModalOpen(false)}
					fetchingItemsLabel={tText(
						'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___bezig-met-ophalen-van-media-items'
					)}
					generatingCsvLabel={tText(
						'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___bezig-met-genereren-van-de-csv'
					)}
					fetchTotalItems={async () => {
						const response = await CollectionsOrBundlesService.getCollectionEditorial(
							0,
							0,
							(tableState.sort_column || 'created_at') as CollectionSortProps,
							tableState.sort_order || 'desc',
							getFilters(tableState),
							EditorialType.MARCOM,
							isCollection,
							false
						);
						return response.total;
					}}
					fetchMoreItems={async (offset: number, limit: number) => {
						const response = await CollectionsOrBundlesService.getCollectionEditorial(
							offset,
							limit,
							(tableState.sort_column || 'created_at') as CollectionSortProps,
							tableState.sort_order || 'desc',
							getFilters(tableState),
							EditorialType.MARCOM,
							isCollection,
							false
						);
						return response.collections;
					}}
					renderValue={(value: any, columnId: string) =>
						renderCollectionsOrBundlesMarcomTableCellText(
							value as any,
							columnId as CollectionOrBundleMarcomOverviewTableCols,
							{ collectionLabels }
						)
					}
					columns={tableColumnListToCsvColumnList(tableColumns)}
					exportFileName={
						isCollection
							? tText(
									'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___collecties-marcom-csv'
							  )
							: tText(
									'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___bundels-marcom-csv'
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
							'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___collecties-marcom'
					  )
					: tText(
							'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___bundels-marcom'
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
										'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___collectie-marcom-beheer-overview-pagina-titel'
								  )
								: tText(
										'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___bundel-marcom-beheer-overview-pagina-titel'
								  )
						)}
					</title>
					<meta
						name="description"
						content={
							isCollection
								? tText(
										'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___collectie-marcom-beheer-overview-pagina-beschrijving'
								  )
								: tText(
										'admin/collections-or-bundles/views/collection-or-bundle-marcom-overview___bundel-marcom-beheer-overview-pagina-beschrijving'
								  )
						}
					/>
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={collections}
					render={renderCollectionOrBundleMarcomOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default compose(withRouter, withUser)(CollectionOrBundleMarcomOverview) as FC;
