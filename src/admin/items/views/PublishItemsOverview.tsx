import { get, isNil, truncate } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { CustomError, formatDate } from '../../../shared/helpers';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import { getDateRangeFilters, getQueryFilter } from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';
import { GET_PUBLISH_ITEM_OVERVIEW_TABLE_COLS, ITEMS_PER_PAGE } from '../items.const';
import { ItemsService } from '../items.service';
import { ItemsTableState, UnpublishedItemsOverviewTableCols } from '../items.types';

const PublishItemsOverview: FunctionComponent = () => {
	const [t] = useTranslation();

	const [items, setItems] = useState<Avo.Item.Item[] | null>(null);
	const [itemCount, setItemCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<ItemsTableState>>({});

	// methods
	const fetchItems = useCallback(async () => {
		const generateWhereObject = (filters: Partial<ItemsTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(
					filters.query,
					// @ts-ignore
					(queryWordWildcard: string, queryWord: string, query: string) => [
						{ pid: { _eq: query } },
					]
				)
			);
			andFilters.push(...getDateRangeFilters(filters, ['updated_at']));

			if (filters.type && filters.type.length) {
				andFilters.push({ type: { label: { _in: filters.type } } });
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

	const renderTableCell = (
		rowData: Partial<Avo.Item.Item>,
		columnId: UnpublishedItemsOverviewTableCols
	) => {
		switch (columnId) {
			case 'updated_at':
				return !isNil(rowData[columnId]) ? formatDate(rowData[columnId] as any) : '-';

			case 'title':
			case 'pid':
				return get(rowData, columnId, '-');

			case 'actions':
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
					renderCell={(rowData: Partial<Avo.Item.Item>, columnId: string) =>
						renderTableCell(rowData, columnId as UnpublishedItemsOverviewTableCols)
					}
					searchTextPlaceholder={t('Zoeken op titel, pid')}
					noContentMatchingFiltersMessage={t(
						'admin/items/views/items-overview___er-zijn-geen-items-doe-voldoen-aan-de-opgegeven-filters'
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
		<AdminLayout pageTitle={t('admin/items/views/items-overview___items')}>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(t('unpublished item beheer overview pagina titel'))}
					</title>
					<meta
						name="description"
						content={t('unpublished item beheer overview pagina beschrijving')}
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
