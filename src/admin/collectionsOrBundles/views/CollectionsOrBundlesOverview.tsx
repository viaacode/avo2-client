import { get, truncate } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { ContentTypeNumber } from '../../../collection/collection.types';
import { APP_PATH } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import { buildLink, CustomError, formatDate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import {
	COLLECTIONS_OR_BUNDLES_PATH,
	GET_USER_OVERVIEW_TABLE_COLS,
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
	const fetchCollectionsOrBundles = useCallback(async () => {
		const generateWhereObject = (filters: Partial<CollectionsOrBundlesTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(filters.query, (queryWordWildcard: string) => [
					{ title: { _ilike: queryWordWildcard } },
					{ description: { _ilike: queryWordWildcard } },
					{
						profile: {
							usersByuserId: { first_name: { _ilike: queryWordWildcard } },
						},
					},
					{
						profile: {
							usersByuserId: { last_name: { _ilike: queryWordWildcard } },
						},
					},
					{
						profile: {
							usersByuserId: { role: { label: { _ilike: queryWordWildcard } } },
						},
					},
				])
			);
			andFilters.push(...getBooleanFilters(filters, ['is_public']));
			andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
			andFilters.push({
				type_id: {
					_eq: isCollection ? ContentTypeNumber.collection : ContentTypeNumber.bundle,
				},
			});
			return { _and: andFilters };
		};

		try {
			const [
				collectionsTemp,
				collectionsCountTemp,
			] = await CollectionsOrBundlesService.getCollections(
				tableState.page || 0,
				(tableState.sort_column || 'created_at') as CollectionsOrBundlesOverviewTableCols,
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
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-collecties-is-mislukt'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___het-ophalen-van-de-bundels-is-mislukt'
					  ),
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
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-heeft-geen-geldig-id'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-bundel-heeft-geen-geldig-id'
					  ),
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
					? t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-collectie-heeft-geen-geldig-id'
					  )
					: t(
							'admin/collections-or-bundles/views/collections-or-bundles-overview___deze-bundel-heeft-geen-geldig-id'
					  ),
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
				return rowData[columnId]
					? t('admin/collections-or-bundles/views/collections-or-bundles-overview___ja')
					: t('admin/collections-or-bundles/views/collections-or-bundles-overview___nee');

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
							ariaLabel={
								isCollection ? t('Bekijk de collectie') : t('Bekijk de bundel')
							}
							title={isCollection ? t('Bekijk de collectie') : t('Bekijk de bundel')}
						/>
						<Button
							type="secondary"
							icon="edit"
							onClick={() => navigateToCollectionEdit(rowData.id)}
							ariaLabel={
								isCollection ? t('Bewerk de collectie') : t('Bewerk de bundel')
							}
							title={isCollection ? t('Bewerk de collectie') : t('Bewerk de bundel')}
						/>
					</ButtonToolbar>
				);

			default:
				return truncate((rowData as any)[columnId] || '-', { length: 50 });
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
					columns={GET_USER_OVERVIEW_TABLE_COLS()}
					data={collections}
					dataCount={collectionCount}
					renderCell={(rowData: Partial<Avo.User.Profile>, columnId: string) =>
						renderTableCell(rowData, columnId as CollectionsOrBundlesOverviewTableCols)
					}
					searchTextPlaceholder={t(
						'admin/collections-or-bundles/views/collections-or-bundles-overview___zoek-op-titel-auteur-rol'
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
		>
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
