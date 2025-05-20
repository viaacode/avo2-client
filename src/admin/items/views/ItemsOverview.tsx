import { ExportAllToCsvModal } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { type Avo, PermissionName } from '@viaa/avo2-types';
import { get } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useMemo, useState } from 'react';
import { Helmet } from 'react-helmet';

import { PermissionService } from '../../../authentication/helpers/permission-service';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { OrderDirection } from '../../../search/search.const';
import { type CheckboxOption } from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { Lookup_Enum_Relation_Types_Enum } from '../../../shared/generated/graphql-db-types';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { tableColumnListToCsvColumnList } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import withUser, { type UserProps } from '../../../shared/hocs/withUser';
import { useCompanies } from '../../../shared/hooks/useCompanies';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import { ADMIN_PATH } from '../../admin.const';
import FilterTable, {
	type FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import { AdminLayoutBody } from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import {
	renderItemsOverviewTableCell,
	renderItemsOverviewTableCellText,
} from '../helpers/render-item-overview-table-cell';
import { GET_ITEM_OVERVIEW_TABLE_COLS, ITEMS_PER_PAGE } from '../items.const';
import { ItemsService } from '../items.service';
import { type ItemsOverviewTableCols, type ItemsTableState } from '../items.types';

import { ItemBulkAction } from './ItemsOverview.types';

const ItemsOverview: FC<UserProps> = ({ commonUser }) => {
	const { tText, tHtml } = useTranslation();

	const [items, setItems] = useState<Avo.Item.Item[] | null>(null);
	const [itemCount, setItemCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<ItemsTableState>>({});
	const [seriesOptions, setSeriesOptions] = useState<CheckboxOption[] | null>(null);
	const [companies] = useCompanies(true);
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [isExportAllToCsvModalOpen, setIsExportAllToCsvModalOpen] = useState(false);

	const companyOptions = useMemo(
		() =>
			companies.map(
				(option: Partial<Avo.Organization.Organization>): CheckboxOption => ({
					id: option.or_id as string,
					label: option.name as string,
					checked: get(tableState, 'organisation', [] as string[]).includes(
						String(option.or_id)
					),
				})
			),
		[companies, tableState]
	);

	const tableColumns = useMemo(
		() => GET_ITEM_OVERVIEW_TABLE_COLS(seriesOptions || [], companyOptions || []),
		[companyOptions, seriesOptions]
	);

	const getColumnDataType = useCallback((): TableColumnDataType => {
		const column = tableColumns.find(
			(tableColumn: FilterableColumn) => tableColumn.id || '' === tableState.sort_column
		);
		return (column?.dataType || TableColumnDataType.string) as TableColumnDataType;
	}, [tableColumns, tableState.sort_column]);

	// methods
	const fetchItems = useCallback(async () => {
		setIsLoading(true);
		const generateWhereObject = (filters: Partial<ItemsTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(filters.query, (queryWildcard: string, query: string) => [
					{ external_id: { _eq: query } },
					{ title: { _ilike: queryWildcard } },
					{ description: { _ilike: queryWildcard } },
					{ lom_keywords: { _contains: query } },
				])
			);
			andFilters.push(...getBooleanFilters(filters, ['is_deleted']));
			if (filters.is_published) {
				const orFilters = [];
				if (filters.is_published.includes('published')) {
					orFilters.push({ is_published: { _eq: true } });
				}
				if (filters.is_published.includes('unpublished')) {
					orFilters.push({
						is_published: { _eq: false },
						depublish_reason: { _is_null: true },
						_not: {
							relations: {
								predicate: { _eq: Lookup_Enum_Relation_Types_Enum.IsReplacedBy },
							},
						},
					});
				}
				if (filters.is_published.includes('unpublished-with-reason')) {
					orFilters.push({
						is_published: { _eq: false },
						depublish_reason: { _is_null: false },
					});
				}
				if (filters.is_published.includes('unpublished-with-merge')) {
					orFilters.push({
						is_published: { _eq: false },
						relations: {
							predicate: { _eq: Lookup_Enum_Relation_Types_Enum.IsReplacedBy },
						},
					});
				}

				if (orFilters.length) {
					andFilters.push({ _or: orFilters });
				}
			}
			andFilters.push(
				...getMultiOptionFilters(filters, ['series', 'organisation'], ['series', 'org_id'])
			);
			andFilters.push(
				...getDateRangeFilters(filters, [
					'updated_at',
					'issued',
					'expiry_date',
					'publish_at',
					'depublish_at',
					'published_at',
				])
			);

			// Only show published/unpublished items based on permissions
			if (!PermissionService.hasPerm(commonUser, PermissionName.VIEW_ANY_PUBLISHED_ITEMS)) {
				andFilters.push({ is_published: { _eq: false } });
			}
			if (!PermissionService.hasPerm(commonUser, PermissionName.VIEW_ANY_UNPUBLISHED_ITEMS)) {
				andFilters.push({ is_published: { _eq: true } });
			}

			if (filters.type && filters.type.length) {
				andFilters.push({ type: { label: { _in: filters.type } } });
			}
			return { _and: andFilters };
		};

		try {
			const [itemsTemp, collectionsCountTemp] = await ItemsService.fetchItemsWithFilters(
				(tableState.page || 0) * ITEMS_PER_PAGE,
				ITEMS_PER_PAGE,
				(tableState.sort_column || 'created_at') as ItemsOverviewTableCols,
				tableState.sort_order || OrderDirection.desc,
				getColumnDataType(),
				generateWhereObject(getFilters(tableState))
			);
			setItems(itemsTemp);
			setItemCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get items from the database', err, { tableState })
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'admin/items/views/items-overview___het-ophalen-van-de-items-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [commonUser, tableState, getColumnDataType, tHtml]);

	const fetchAllSeries = useCallback(async () => {
		try {
			setSeriesOptions(
				((await ItemsService.fetchAllSeries()) || []).map(
					(serie: string): CheckboxOption => ({ id: serie, label: serie, checked: false })
				)
			);
		} catch (err) {
			console.error(new CustomError('Failed to load all item series from the database', err));
			ToastService.danger(
				tHtml(
					'admin/items/views/items-overview___het-ophalen-van-de-reeks-opties-is-mislukt'
				)
			);
		}
	}, [tHtml]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	useEffect(() => {
		fetchAllSeries();
	}, [fetchAllSeries]);

	useEffect(() => {
		if (items) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [setLoadingInfo, items]);

	const handleBulkActionClicked = (action: ItemBulkAction) => {
		if (action === ItemBulkAction.EXPORT_ALL) {
			setIsExportAllToCsvModalOpen(true);
		}
	};

	const getItemDetailLink = (externalId: string | undefined) => {
		return buildLink(APP_PATH.ITEM_DETAIL.route, { id: externalId });
	};

	const getItemAdminDetailLink = (uuid: string | undefined) => {
		return buildLink(ADMIN_PATH.ITEM_DETAIL, { id: uuid });
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={tHtml('admin/items/views/items-overview___er-bestaan-nog-geen-items')}
			>
				<p>
					{tHtml(
						'admin/items/views/items-overview___beschrijving-wanneer-er-nog-geen-items-zijn'
					)}
				</p>
			</ErrorView>
		);
	};

	const renderItemsOverview = () => {
		if (!items) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={tableColumns}
					data={items}
					dataCount={itemCount}
					renderCell={(rowData: Partial<Avo.Item.Item>, columnId: string) =>
						renderItemsOverviewTableCell(rowData, columnId as ItemsOverviewTableCols, {
							getItemDetailLink,
							getItemAdminDetailLink,
						})
					}
					searchTextPlaceholder={tText(
						'admin/items/views/items-overview___zoek-op-pid-titel-beschrijving-organisatie'
					)}
					noContentMatchingFiltersMessage={tText(
						'admin/items/views/items-overview___er-zijn-geen-items-doe-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="uid"
					isLoading={isLoading}
					showCheckboxes={false}
					bulkActions={[
						{
							label: tText('admin/items/views/items-overview___exporteer-alles'),
							value: ItemBulkAction.EXPORT_ALL,
						},
					]}
					onSelectBulkAction={(action) =>
						handleBulkActionClicked(action as ItemBulkAction)
					}
				/>
				<ExportAllToCsvModal
					title={tText(
						'admin/items/views/items-overview___exporteren-van-alle-media-items-naar-csv'
					)}
					isOpen={isExportAllToCsvModalOpen}
					onClose={() => setIsExportAllToCsvModalOpen(false)}
					fetchingItemsLabel={tText(
						'admin/items/views/items-overview___bezig-met-ophalen-van-media-items'
					)}
					generatingCsvLabel={tText(
						'admin/items/views/items-overview___bezig-met-genereren-van-de-csv'
					)}
					fetchTotalItems={async () => {
						const response = await ItemsService.fetchItemsWithFilters(
							0,
							0,
							(tableState.sort_column || 'created_at') as ItemsOverviewTableCols,
							tableState.sort_order || OrderDirection.desc,
							getColumnDataType(),
							{}
						);
						return response[1];
					}}
					fetchMoreItems={async (offset: number, limit: number) => {
						const response = await ItemsService.fetchItemsWithFilters(
							offset,
							limit,
							(tableState.sort_column || 'created_at') as ItemsOverviewTableCols,
							tableState.sort_order || OrderDirection.desc,
							getColumnDataType(),
							{}
						);
						return response[0];
					}}
					renderValue={(value: any, columnId: string) =>
						renderItemsOverviewTableCellText(
							value as Partial<Avo.Item.Item>,
							columnId as ItemsOverviewTableCols
						)
					}
					columns={tableColumnListToCsvColumnList(tableColumns)}
					exportFileName={tText('admin/items/views/items-overview___media-items-csv')}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText('admin/items/views/items-overview___items')}
			size="full-width"
		>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/items/views/items-overview___item-beheer-overview-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/items/views/items-overview___item-beheer-overview-pagina-beschrijving'
						)}
					/>
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={items}
					render={renderItemsOverview}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default withUser(ItemsOverview) as FC;
