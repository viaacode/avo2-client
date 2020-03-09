import { get, isNil, truncate } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import { ContentTypeNumber } from '../../../collection/collection.types';
import { APP_PATH } from '../../../constants';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import {
	COLLECTIONS_OR_BUNDLES_PATH,
	USER_OVERVIEW_TABLE_COLS,
} from '../collections-or-bundles.const';
import { CollectionsOrBundlesService } from '../collections-or-bundles.service';
import {
	CollectionsOrBundlesOverviewTableCols,
	CollectionsOrBundlesTableState,
} from '../collections-or-bundles.types';

interface CollectionsOrBundlesOverviewProps extends DefaultSecureRouteProps {}

const CollectionsOrBundlesOverview: FunctionComponent<CollectionsOrBundlesOverviewProps> = ({
	history,
	location,
}) => {
	const [t] = useTranslation();

	const [collections, setCollections] = useState<Avo.Collection.Collection[] | null>(null);
	const [collectionCount, setCollectionCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<CollectionsOrBundlesTableState>>({});

	// computed
	const isCollection = location.pathname === COLLECTIONS_OR_BUNDLES_PATH.COLLECTIONS_OVERVIEW;

	// methods
	const generateWhereObject = (filters: Partial<CollectionsOrBundlesTableState>) => {
		const andFilters: any[] = [];
		if (filters.query) {
			filters.query.split(' ').forEach(queryPart => {
				const query = `%${queryPart}%`;
				andFilters.push({
					_or: [
						{ title: { _ilike: query } },
						{ profile: { usersByuserId: { first_name: { _ilike: query } } } },
						{ profile: { usersByuserId: { last_name: { _ilike: query } } } },
						{ profile: { usersByuserId: { role: { label: { _ilike: query } } } } },
					],
				});
			});
		}
		if (!isNil(filters.is_public)) {
			andFilters.push({ is_public: filters.is_public });
		}
		const dateFilters: CollectionsOrBundlesOverviewTableCols[] = ['created_at', 'updated_at'];
		dateFilters.forEach((dateProp: CollectionsOrBundlesOverviewTableCols) => {
			const rangeValue = (filters as any)[dateProp];
			if (rangeValue) {
				andFilters.push({
					[dateProp]: {
						...(rangeValue && rangeValue.gte ? { _gte: rangeValue.gte } : null),
						...(rangeValue && rangeValue.lte ? { _lte: rangeValue.lte } : null),
					},
				});
			}
		});
		andFilters.push({
			type_id: {
				_eq: isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
			},
		});
		return { _and: andFilters };
	};

	const fetchCollectionsOrBundles = useCallback(async () => {
		try {
			const [
				collectionsTemp,
				collectionsCountTemp,
			] = await CollectionsOrBundlesService.getCollections(
				tableState.page || 0,
				tableState.sort_column || 'created_at',
				tableState.sort_order || 'desc',
				generateWhereObject(getFilters(tableState))
			);
			setCollections(collectionsTemp);
			setCollectionCount(collectionsCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get users from the database', err, { tableState })
			);
			setLoadingInfo({
				state: 'error',
				message: isCollection
					? t('Het ophalen van de collecties is mislukt')
					: t('Het ophalen van de bundels is mislukt'),
			});
		}
	}, [setLoadingInfo, setCollections, setCollectionCount, tableState, isCollection, t]);

	useEffect(() => {
		fetchCollectionsOrBundles();
	}, [fetchCollectionsOrBundles]);

	useEffect(() => {
		if (collections) {
			setLoadingInfo({
				state: 'loaded',
			});
		}
	}, [setLoadingInfo, collections]);

	const navigateToCollectionDetail = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(
				isCollection
					? t('Deze collectie heeft geen geldig id')
					: t('Deze bundel heeft geen geldig id'),
				false
			);
			return;
		}
		const detailRoute = isCollection
			? APP_PATH.COLLECTION_DETAIL.route
			: APP_PATH.BUNDLE_DETAIL.route;
		const link = buildLink(detailRoute, { id });
		redirectToClientPage(link, history);
	};

	const navigateToCollectionEdit = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(
				isCollection
					? t('Deze collectie heeft geen geldig id')
					: t('Deze bundel heeft geen geldig id'),
				false
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
			case 'author_first_name':
				return get(rowData, 'profile.usersByuserId.first_name', '-');

			case 'author_last_name':
				return get(rowData, 'profile.usersByuserId.last_name', '-');

			case 'author_role':
				return get(rowData, 'profile.usersByuserId.role.label', '-');

			case 'is_public':
				return rowData[columnId] ? t('Ja') : t('Nee');

			case 'created_at':
			case 'updated_at':
				return formatDate(rowData[columnId]) || '-';

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							type="secondary"
							icon="eye"
							onClick={() => navigateToCollectionDetail(rowData.id)}
						/>
						<Button
							type="secondary"
							icon="edit"
							onClick={() => navigateToCollectionEdit(rowData.id)}
						/>
					</ButtonToolbar>
				);

			default:
				return truncate((rowData as any)[columnId] || '-', { length: 50 });
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView message={t('Er bestaan nog geen collecties')}>
				<p>
					<Trans>Beschrijving wanneer er nog geen collecties zijn</Trans>
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
					columns={USER_OVERVIEW_TABLE_COLS}
					data={collections}
					dataCount={collectionCount}
					renderCell={(rowData: Partial<Avo.User.Profile>, columnId: string) =>
						renderTableCell(rowData, columnId as CollectionsOrBundlesOverviewTableCols)
					}
					searchTextPlaceholder={t('Zoek op titel, auteur, rol, ...')}
					noContentMatchingFiltersMessage={
						isCollection
							? t('Er zijn geen collecties doe voldoen aan de opgegeven filters')
							: t('Er zijn geen bundels doe voldoen aan de opgegeven filters')
					}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					renderNoResults={renderNoResults}
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={isCollection ? t('Collecties') : t('Bundels')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={collections}
							render={renderCollectionsOrBundlesOverview}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default CollectionsOrBundlesOverview;
