import { Button, ButtonToolbar, IconName } from '@viaa/avo2-components';
import { get, isNil, truncate } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { withRouter } from 'react-router-dom';
import { compose } from 'redux';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { OrderDirection } from '../../../search/search.const';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { formatTimestamp } from '../../../shared/helpers/formatters';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import withUser from '../../../shared/hocs/withUser';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import { getDateRangeFilters, getQueryFilter } from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { GET_PUBLISH_ITEM_OVERVIEW_TABLE_COLS, ITEMS_PER_PAGE } from '../items.const';
import { ItemsService } from '../items.service';
import {
	type UnpublishedItem,
	type UnpublishedItemsOverviewTableCols,
	type UnpublishedItemsTableState,
} from '../items.types';

const PublishItemsOverview: FC<DefaultSecureRouteProps> = ({ history }) => {
	const { tText, tHtml } = useTranslation();

	const [items, setItems] = useState<UnpublishedItem[] | null>(null);
	const [selectedItemIds, setSelectedItemIds] = useState<string[]>([]);
	const [itemCount, setItemCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<UnpublishedItemsTableState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const generateWhereObject = useCallback((filters: Partial<UnpublishedItemsTableState>) => {
		const andFilters: any[] = [];
		andFilters.push(
			...getQueryFilter(filters.query, (queryWildcard: string, query: string) => [
				{ pid: { _eq: query } },
				{ title: { _ilike: queryWildcard } },
			])
		);
		andFilters.push(...getDateRangeFilters(filters, ['updated_at']));

		// The status column in the shared_items table indicated the MAM update status.
		// This is not the status we want to display in the UI
		// We want 'NEW' if the item does not exist in the app.item_meta table yet,
		// and 'UPDATE' if the item already exist in the app.item_meta table
		if (filters.status && filters.status.length === 1) {
			if (filters.status[0] === 'NEW') {
				andFilters.push({
					status: { _in: ['NEW', 'UPDATE'] },
					_not: { item_meta: {} },
				});
			} else {
				andFilters.push({
					status: { _in: ['NEW', 'UPDATE'] },
					item_meta: {},
				});
			}
		} else {
			andFilters.push({ status: { _in: ['NEW', 'UPDATE'] } });
		}
		return { _and: andFilters };
	}, []);

	// methods
	const fetchItems = useCallback(async () => {
		setIsLoading(true);
		try {
			const [itemsTemp, collectionsCountTemp] =
				await ItemsService.fetchUnpublishedItemsWithFilters(
					tableState.page || 0,
					(tableState.sort_column || 'updated_at') as UnpublishedItemsOverviewTableCols,
					tableState.sort_order || OrderDirection.desc,
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
	}, [tableState, generateWhereObject, tHtml]);

	useEffect(() => {
		fetchItems();
	}, [fetchItems]);

	useEffect(() => {
		if (items) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [setLoadingInfo, items]);

	const navigateToItemDetail = (externalId: string | undefined) => {
		if (!externalId) {
			ToastService.danger(
				tHtml('admin/items/views/items-overview___dit-item-heeft-geen-geldig-pid')
			);
			return;
		}
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, { id: externalId });
		redirectToClientPage(link, history);
	};

	const navigateToAdminItemDetail = (uuid: string | undefined) => {
		if (!uuid) {
			ToastService.danger(
				tHtml('admin/items/views/items-overview___dit-item-heeft-geen-geldig-uuid')
			);
			return;
		}
		const link = buildLink(ADMIN_PATH.ITEM_DETAIL, { id: uuid });
		redirectToClientPage(link, history);
	};

	const publishSelection = async () => {
		try {
			if (!selectedItemIds || !selectedItemIds.length) {
				ToastService.info(
					tHtml(
						'admin/items/views/publish-items-overview___selecteer-eerst-enkele-items-die-je-wil-publiceren-dmv-de-checkboxes'
					)
				);
				return;
			}
			await ItemsService.setSharedItemsStatus(selectedItemIds || [], 'OK');
			await fetchItems();
			ToastService.success(
				tHtml(
					'admin/items/views/publish-items-overview___de-geselecteerde-items-zijn-gepubliceerd-naar-av-o'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to set status for shared.items', err, { selectedItemIds })
			);
			ToastService.danger(
				tHtml(
					'admin/items/views/publish-items-overview___het-publiceren-van-de-items-is-mislukt'
				)
			);
		}
	};

	const triggerMamSync = async () => {
		try {
			const result: string = await ItemsService.triggerMamSync();
			if (result === 'SCHEDULED') {
				ToastService.success(
					tHtml(
						'admin/items/views/publish-items-overview___een-mam-synchronisatie-is-gestart'
					)
				);
			} else {
				ToastService.info(
					tHtml(
						'admin/items/views/publish-items-overview___een-mam-synchronisatie-is-reeds-bezig'
					)
				);
			}
		} catch (err) {
			console.error(new CustomError('Failed to trigger MAM sync', err));
			ToastService.danger(
				tHtml(
					'admin/items/views/publish-items-overview___het-triggeren-van-een-mam-synchronisatie-is-mislukt'
				)
			);
		}
	};

	const setAllItemsAsSelected = async () => {
		setIsLoading(true);
		try {
			const itemPids: string[] = await ItemsService.getUnpublishedItemPids(
				generateWhereObject(getFilters(tableState))
			);
			ToastService.info(
				tHtml(
					'admin/items/views/publish-items-overview___je-hebt-num-of-selected-items-items-geselecteerd',
					{
						numOfSelectedItems: itemPids.length,
					}
				)
			);
			setSelectedItemIds(itemPids);
		} catch (err) {
			console.error(
				new CustomError(
					'Failed to fetch all item pids that adhere to the selected filters',
					err,
					{ tableState }
				)
			);
			ToastService.danger(
				tHtml(
					'admin/items/views/publish-items-overview___het-ophalen-van-alle-item-ids-is-mislukt'
				)
			);
		}

		setIsLoading(false);
	};

	const renderTableCell = (
		rowData: Partial<UnpublishedItem>,
		columnId: UnpublishedItemsOverviewTableCols
	) => {
		switch (columnId) {
			case 'updated_at':
				return !isNil(rowData[columnId]) ? formatTimestamp(rowData[columnId] as any) : '-';

			case 'title':
			case 'pid':
				return get(rowData, columnId, '-');

			case 'status':
				if (rowData.item_meta) {
					return tText('admin/items/views/publish-items-overview___update');
				}
				return tText('admin/items/views/publish-items-overview___nieuw');

			case ACTIONS_TABLE_COLUMN_ID: {
				const itemExternalId: string | undefined = get(rowData, 'item_meta.external_id');
				const itemUid: string | undefined = get(rowData, 'item_meta.uid');

				if (itemExternalId) {
					return (
						<ButtonToolbar>
							<Button
								type="secondary"
								icon={IconName.eye}
								onClick={() => navigateToItemDetail(itemExternalId)}
								title={tText(
									'admin/items/views/items-overview___bekijk-item-in-de-website'
								)}
								ariaLabel={tText(
									'admin/items/views/items-overview___bekijk-item-in-de-website'
								)}
							/>
							<Button
								type="secondary"
								icon={IconName.edit}
								onClick={() => navigateToAdminItemDetail(itemUid)}
								title={tText(
									'admin/items/views/items-overview___bekijk-item-details-in-het-beheer'
								)}
								ariaLabel={tText(
									'admin/items/views/items-overview___bekijk-item-details-in-het-beheer'
								)}
							/>
						</ButtonToolbar>
					);
				}

				return null;
			}

			default:
				return truncate((rowData as any)[columnId] || '-', { length: 60 });
		}
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
					columns={GET_PUBLISH_ITEM_OVERVIEW_TABLE_COLS()}
					data={items}
					dataCount={itemCount}
					renderCell={(rowData: Partial<UnpublishedItem>, columnId: string) =>
						renderTableCell(rowData, columnId as UnpublishedItemsOverviewTableCols)
					}
					searchTextPlaceholder={tText(
						'admin/items/views/publish-items-overview___zoeken-op-titel-pid'
					)}
					noContentMatchingFiltersMessage={tText(
						'admin/items/views/items-overview___er-zijn-geen-items-doe-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="pid"
					showCheckboxes
					selectedItemIds={selectedItemIds}
					onSelectionChanged={(newSelectedIds) => {
						setSelectedItemIds(newSelectedIds as string[]);
					}}
					onSelectAll={setAllItemsAsSelected}
					isLoading={isLoading}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText('admin/items/views/items-overview___items')}
			size="full-width"
		>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button
						icon={IconName.externalLink}
						type="danger"
						label={tText('admin/items/views/publish-items-overview___publiceren')}
						onClick={publishSelection}
					/>
					<Button
						icon={IconName.download}
						type="primary"
						label={tText(
							'admin/items/views/publish-items-overview___synchroniseren-met-mam'
						)}
						title={tText(
							'admin/items/views/publish-items-overview___kopieer-nieuwe-en-aangepaste-items-van-het-mam-naar-de-avo-database'
						)}
						onClick={triggerMamSync}
					/>
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/items/views/publish-items-overview___publiceer-items-beheer-overview-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/items/views/publish-items-overview___unpublished-item-beheer-overview-pagina-beschrijving'
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

export default compose(withRouter, withUser)(PublishItemsOverview) as FC;
