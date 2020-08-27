import { get, isNil, truncate } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError, formatTimestamp } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import { getDateRangeFilters, getQueryFilter } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { GET_PUBLISH_ITEM_OVERVIEW_TABLE_COLS, ITEMS_PER_PAGE } from '../items.const';
import { ItemsService } from '../items.service';
import {
	UnpublishedItem,
	UnpublishedItemsOverviewTableCols,
	UnpublishedItemsTableState,
} from '../items.types';

interface PublishItemsOverviewProps extends DefaultSecureRouteProps {}

const PublishItemsOverview: FunctionComponent<PublishItemsOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	const [items, setItems] = useState<UnpublishedItem[] | null>(null);
	const [selectedItems, setSelectedItems] = useState<UnpublishedItem[]>([]);
	const [itemCount, setItemCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<UnpublishedItemsTableState>>({});

	// methods
	const fetchItems = useCallback(async () => {
		const generateWhereObject = (filters: Partial<UnpublishedItemsTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(
					filters.query,
					// @ts-ignore
					(queryWordWildcard: string, queryWord: string, query: string) => [
						{ pid: { _eq: query } },
						{ pid: { _eq: query } },
					]
				)
			);
			andFilters.push(...getDateRangeFilters(filters, ['updated_at']));
			andFilters.push({ status: { _is_null: false } });

			if (filters.status && filters.status.length) {
				andFilters.push({ status: { _in: filters.status } });
			}
			return { _and: andFilters };
		};

		try {
			const [
				itemsTemp,
				collectionsCountTemp,
			] = await ItemsService.fetchUnpublishedItemsWithFilters(
				tableState.page || 0,
				(tableState.sort_column || 'updated_at') as UnpublishedItemsOverviewTableCols,
				tableState.sort_order || 'desc',
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
				message: t(
					'admin/items/views/items-overview___het-ophalen-van-de-items-is-mislukt'
				),
			});
		}
	}, [setLoadingInfo, setItems, setItemCount, tableState, t]);

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
				t('admin/items/views/items-overview___dit-item-heeft-geen-geldig-pid'),
				false
			);
			return;
		}
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, { id: externalId });
		redirectToClientPage(link, history);
	};

	const navigateToAdminItemDetail = (uuid: string | undefined) => {
		if (!uuid) {
			ToastService.danger(
				t('admin/items/views/items-overview___dit-item-heeft-geen-geldig-uuid'),
				false
			);
			return;
		}
		const link = buildLink(ADMIN_PATH.ITEM_DETAIL, { id: uuid });
		redirectToClientPage(link, history);
	};

	const publishSelection = async () => {
		try {
			if (!selectedItems.length) {
				ToastService.info(
					t(
						'admin/items/views/publish-items-overview___selecteer-eerst-enkele-items-die-je-wil-publiceren-dmv-de-checkboxes'
					),
					false
				);
				return;
			}
			await ItemsService.setSharedItemsStatus(
				(selectedItems || []).map(item => item.pid),
				'OK'
			);
			ToastService.success(t('De geselecteerde items zijn gepubliceerd naar AvO'), false);
			fetchItems();
		} catch (err) {
			console.error(
				new CustomError('Failed to set status for shared.items', err, { selectedItems })
			);
			ToastService.danger(t('Het publiceren van de items is mislukt'), false);
		}
	};

	const triggerMamSync = () => {
		ToastService.info(
			t('admin/items/views/publish-items-overview___nog-niet-geimplementeerd'),
			false
		);
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
				switch (rowData.status) {
					case 'NEW':
						return t('Nieuw');
					case 'UPDATE':
						return t('Update');
					case 'OK':
						return t('Bezig met publiceren');
					default:
						return t('Onbekend');
				}

			case 'actions':
				const itemExternalId: string | undefined = get(rowData, 'item_meta.external_id');
				const itemUid: string | undefined = get(rowData, 'item_meta.uid');
				if (itemExternalId) {
					return (
						<ButtonToolbar>
							<Button
								type="secondary"
								icon="eye"
								onClick={() => navigateToItemDetail(itemExternalId)}
								title={t(
									'admin/items/views/items-overview___bekijk-item-in-de-website'
								)}
								ariaLabel={t(
									'admin/items/views/items-overview___bekijk-item-in-de-website'
								)}
							/>
							<Button
								type="secondary"
								icon="edit"
								onClick={() => navigateToAdminItemDetail(itemUid)}
								title={t(
									'admin/items/views/items-overview___bekijk-item-details-in-het-beheer'
								)}
								ariaLabel={t(
									'admin/items/views/items-overview___bekijk-item-details-in-het-beheer'
								)}
							/>
						</ButtonToolbar>
					);
				}
				return null;

			default:
				return truncate((rowData as any)[columnId] || '-', { length: 60 });
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView message={t('admin/items/views/items-overview___er-bestaan-nog-geen-items')}>
				<p>
					<Trans i18nKey="admin/items/views/items-overview___beschrijving-wanneer-er-nog-geen-items-zijn">
						Beschrijving wanneer er nog geen items zijn
					</Trans>
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
					searchTextPlaceholder={t('Zoeken op pid')}
					noContentMatchingFiltersMessage={t(
						'admin/items/views/items-overview___er-zijn-geen-items-doe-voldoen-aan-de-opgegeven-filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="pid"
					showCheckboxes
					selectedItems={items.filter(item =>
						selectedItems.map(item => item.pid).includes(item.pid)
					)}
					onSelectionChanged={newSelection => {
						setSelectedItems(newSelection);
					}}
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('admin/items/views/items-overview___items')}>
			<AdminLayoutTopBarRight>
				<ButtonToolbar>
					<Button
						icon="external-link"
						type="danger"
						label={t('admin/items/views/publish-items-overview___publiceren')}
						onClick={publishSelection}
					/>
					<Button
						icon="download"
						type="primary"
						label={t(
							'admin/items/views/publish-items-overview___synchroniseren-met-mam'
						)}
						title={t(
							'admin/items/views/publish-items-overview___kopieer-nieuwe-en-aangepaste-items-van-het-mam-naar-de-avo-database'
						)}
						onClick={triggerMamSync}
					/>
				</ButtonToolbar>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/items/views/publish-items-overview___publiceer-items-beheer-overview-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/items/views/publish-items-overview___unpublished-item-beheer-overview-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<Container mode="vertical" size="small">
					<Container mode="horizontal" size="full-width">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={items}
							render={renderItemsOverview}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default PublishItemsOverview;
