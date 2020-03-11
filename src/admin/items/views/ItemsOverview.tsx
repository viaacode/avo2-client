import { get, isNil, truncate } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { APP_PATH } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ADMIN_PATH } from '../../admin.const';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import { ITEM_OVERVIEW_TABLE_COLS } from '../items.const';
import { ItemsService } from '../items.service';
import { ItemsOverviewTableCols, ItemsTableState } from '../items.types';

interface ItemsOverviewProps extends DefaultSecureRouteProps {}

const ItemsOverview: FunctionComponent<ItemsOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	const [items, setItems] = useState<Avo.Item.Item[] | null>(null);
	const [itemCount, setItemCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<ItemsTableState>>({});

	// methods
	const generateWhereObject = (filters: Partial<ItemsTableState>) => {
		const andFilters: any[] = [];
		andFilters.push(
			...getQueryFilter(filters.query, query => [
				{ external_id: { _eq: filters.query } },
				{ title: { _ilike: query } },
				{ description: { _ilike: query } },
				{ organisation: { name: { _ilike: query } } },
				{ series: { _ilike: query } },
			])
		);
		andFilters.push(...getBooleanFilters(filters, ['is_published', 'is_deleted']));
		andFilters.push(
			...getDateRangeFilters(filters, [
				'created_at',
				'updated_at',
				'issued',
				'expiry_date',
				'publish_at',
				'depublish_at',
				'published_at',
			])
		);
		if (filters.type && filters.type.length) {
			andFilters.push({ type: { label: { _in: filters.type } } });
		}
		return { _and: andFilters };
	};

	const fetchItems = useCallback(async () => {
		try {
			const [itemsTemp, collectionsCountTemp] = await ItemsService.fetchItems(
				tableState.page || 0,
				(tableState.sort_column || 'created_at') as ItemsOverviewTableCols,
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
				message: t('Het ophalen van de items is mislukt'),
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
			ToastService.danger(t('Dit item heeft geen geldig pid'), false);
			return;
		}
		const link = buildLink(APP_PATH.ITEM_DETAIL.route, { id: externalId });
		redirectToClientPage(link, history);
	};

	const navigateToAdminItemDetail = (uuid: string | undefined) => {
		if (!uuid) {
			ToastService.danger(t('Dit item heeft geen geldig uuid'), false);
			return;
		}
		const link = buildLink(ADMIN_PATH.ITEM_DETAIL, { id: uuid });
		redirectToClientPage(link, history);
	};

	const renderTableCell = (rowData: Partial<Avo.Item.Item>, columnId: ItemsOverviewTableCols) => {
		switch (columnId) {
			case 'created_at':
			case 'updated_at':
			case 'depublish_at':
			case 'expiry_date':
			case 'issued':
			case 'publish_at':
			case 'published_at':
				return !isNil(rowData[columnId]) ? formatDate(rowData[columnId] as any) : '-';

			case 'organisation':
				return get(rowData, 'organisation.name', '-');

			case 'type':
				return get(rowData, 'type.label', '-');

			case 'views':
				return get(rowData, 'view_counts_aggregate.aggregate.count', '-');

			case 'is_published':
			case 'is_deleted':
				return rowData[columnId] ? 'Ja' : 'Nee';

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							type="secondary"
							icon="eye"
							onClick={() => navigateToItemDetail(rowData.external_id)}
						/>
						<Button
							type="secondary"
							icon="edit"
							onClick={() => navigateToAdminItemDetail(rowData.uid)}
						/>
					</ButtonToolbar>
				);

			default:
				return truncate((rowData as any)[columnId] || '-', { length: 50 });
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView message={t('Er bestaan nog geen items')}>
				<p>
					<Trans>Beschrijving wanneer er nog geen items zijn</Trans>
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
					columns={ITEM_OVERVIEW_TABLE_COLS}
					data={items}
					dataCount={itemCount}
					renderCell={(rowData: Partial<Avo.Item.Item>, columnId: string) =>
						renderTableCell(rowData, columnId as ItemsOverviewTableCols)
					}
					searchTextPlaceholder={t('Zoek op pid, titel, beschrijving, organisatie, ...')}
					noContentMatchingFiltersMessage={t(
						'Er zijn geen items doe voldoen aan de opgegeven filters'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
					rowKey="uid"
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('Items')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
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

export default ItemsOverview;
