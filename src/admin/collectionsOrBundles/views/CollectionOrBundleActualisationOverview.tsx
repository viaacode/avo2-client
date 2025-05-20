import { ExportAllToCsvModal } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { type Avo } from '@viaa/avo2-types';
import { noop } from 'lodash-es';
import React, { type FC, type ReactNode, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { OrderDirection } from '../../../search/search.const';
import { type CheckboxOption } from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../../../shared/helpers/custom-error';
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
	GET_COLLECTION_ACTUALISATION_COLUMNS,
	ITEMS_PER_PAGE,
} from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	CollectionBulkAction,
	type CollectionOrBundleActualisationOverviewTableCols,
	type CollectionOrBundleActualisationTableState,
	type CollectionSortProps,
	EditorialType,
} from '../collections-or-bundles.types';
import {
	renderCollectionsOrBundleActualisationCellReact,
	renderCollectionsOrBundleActualisationCellText,
} from '../helpers/render-collection-columns';

const CollectionOrBundleActualisationOverview: FC<DefaultSecureRouteProps> = ({
	location,
	commonUser,
}) => {
	const { tText, tHtml } = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<
		Partial<CollectionOrBundleActualisationTableState>
	>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] = useState(false);

	const [selectedCollectionIds, setSelectedCollectionIds] = useState<string[]>([]);

	const [userGroups] = useUserGroups(false);
	const [subjects] = useLomSubjects();
	const { data: educationLevelsAndDegrees } = useLomEducationLevelsAndDegrees();
	const { data: allQualityLabels } = useQualityLabels();
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
			...(allQualityLabels || []).map(
				(option): CheckboxOption => ({
					id: String(option.value),
					label: option.description,
					checked: ((tableState?.collection_labels || []) as string[]).includes(
						String(option.value)
					),
				})
			),
		],
		[allQualityLabels, tText, tableState]
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

	const tableColumns = useMemo(
		() =>
			GET_COLLECTION_ACTUALISATION_COLUMNS(
				userGroupOptions,
				collectionLabelOptions,
				subjects,
				educationLevelsAndDegrees || [],
				organisationOptions
			),
		[
			collectionLabelOptions,
			educationLevelsAndDegrees,
			subjects,
			userGroupOptions,
			organisationOptions,
		]
	);

	const isCollection =
		location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTION_ACTUALISATION_OVERVIEW;

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
					(tableState.sort_column || 'created_at') as CollectionSortProps,
					tableState.sort_order || OrderDirection.desc,
					getFilters(tableState),
					EditorialType.ACTUALISATION,
					isCollection,
					true
				);
			setCollections(collectionsTemp);
			setCollectionCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get collection actualisations from the database', err, {
					tableState,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? tText(
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___het-ophalen-van-de-collectie-actualisaties-is-mislukt'
					  )
					: tText(
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___het-ophalen-van-de-bundel-actualisaties-is-mislukt'
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
					'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___het-ophalen-van-de-collectie-ids-is-mislukt'
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

	const renderCollectionOrBundleActualisationOverview = () => {
		if (!collections) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={tableColumns}
					data={collections}
					dataCount={collectionCount}
					renderCell={(collectionOrBundle: any, columnId: string) => {
						return renderCollectionsOrBundleActualisationCellReact(
							collectionOrBundle as Partial<Avo.Collection.Collection>,
							columnId as CollectionOrBundleActualisationOverviewTableCols,
							{
								isCollection,
								allQualityLabels: allQualityLabels || [],
								editStatuses: [],
								commonUser,
							}
						);
					}}
					searchTextPlaceholder={tText(
						'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___zoek-op-titel-beschrijving-auteur'
					)}
					noContentMatchingFiltersMessage={
						isCollection
							? tText(
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___er-zijn-geen-collectie-actualisaties-die-voldoen-aan-de-opgegeven-filters'
							  )
							: tText(
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___er-zijn-geen-bundel-actualisaties-die-voldoen-aan-de-opgegeven-filters'
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
								'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___exporteer-alles'
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
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___exporteren-van-alle-collecties-naar-csv'
							  )
							: tText(
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___exporteren-van-alle-bundels-naar-csv'
							  )
					}
					isOpen={isExportAllToCsvModalOpen}
					onClose={() => setIsExportAllToCsvModalOpen(false)}
					fetchingItemsLabel={tText(
						'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bezig-met-ophalen-van-media-items'
					)}
					generatingCsvLabel={tText(
						'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bezig-met-genereren-van-de-csv'
					)}
					fetchTotalItems={async () => {
						const response = await CollectionsOrBundlesService.getCollectionEditorial(
							0,
							0,
							(tableState.sort_column || 'created_at') as CollectionSortProps,
							tableState.sort_order || OrderDirection.desc,
							getFilters(tableState),
							EditorialType.ACTUALISATION,
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
							tableState.sort_order || OrderDirection.desc,
							getFilters(tableState),
							EditorialType.ACTUALISATION,
							isCollection,
							false
						);
						return response.collections;
					}}
					renderValue={(value: any, columnId: string) =>
						renderCollectionsOrBundleActualisationCellText(
							value as any,
							columnId as CollectionOrBundleActualisationOverviewTableCols,
							{
								isCollection,
								allQualityLabels: allQualityLabels || [],
								editStatuses: [],
								commonUser,
							}
						)
					}
					columns={tableColumnListToCsvColumnList(tableColumns)}
					exportFileName={
						isCollection
							? tText(
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___collecties-actualisatie-csv'
							  )
							: tText(
									'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bundels-actualisatie-csv'
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
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___collecties-actualisatie'
					  )
					: tText(
							'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bundels-actualisatie'
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
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___collectie-actualisation-beheer-overview-pagina-titel'
								  )
								: tText(
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bundel-actualisation-beheer-overview-pagina-titel'
								  )
						)}
					</title>
					<meta
						name="description"
						content={
							isCollection
								? tText(
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___collectie-actualisation-beheer-overview-pagina-beschrijving'
								  )
								: tText(
										'admin/collections-or-bundles/views/collection-or-bundle-actualisation-overview___bundel-actualisation-beheer-overview-pagina-beschrijving'
								  )
						}
					/>
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={collections}
					render={renderCollectionOrBundleActualisationOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default compose(withRouter, withUser)(CollectionOrBundleActualisationOverview) as FC;
