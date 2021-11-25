import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../../shared/components';
import QuickLaneFilterTableCell from '../../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { ITEMS_PER_PAGE, QUICK_LANE_COLUMNS } from '../../../shared/constants/quick-lane';
import { CustomError, isMobileWidth } from '../../../shared/helpers';
import { getTypeOptions } from '../../../shared/helpers/quick-lane';
import { useDebounce } from '../../../shared/hooks';
import { QuickLaneOverviewFilterState, QuickLaneUrlObject } from '../../../shared/types';
import FilterTable, { FilterableColumn } from '../../shared/components/FilterTable/FilterTable';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

interface QuickLaneOverviewProps extends DefaultSecureRouteProps {}

const QuickLaneOverview: FunctionComponent<QuickLaneOverviewProps> = ({ user }) => {
	const [t] = useTranslation();

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [quickLanes, setQuickLanes] = useState<QuickLaneUrlObject[]>([]);

	const [filters, setFilters] = useState<QuickLaneOverviewFilterState | undefined>(undefined);
	const debouncedFilters: QuickLaneOverviewFilterState | undefined = useDebounce(filters, 250);

	// Configuration

	const columns: FilterableColumn[] = [
		{
			id: QUICK_LANE_COLUMNS.TITLE,
			label: t('workspace/views/quick-lane-overview___titel'),
			sortable: true,
			dataType: 'string',
			visibleByDefault: true,
		},
		// Hide type on mobile
		...(isMobileWidth()
			? []
			: [
					{
						id: QUICK_LANE_COLUMNS.CONTENT_LABEL,
						label: t('workspace/views/quick-lane-overview___type'),
						sortable: true,
						dataType: 'string',
						visibleByDefault: true,
						filterType: 'CheckboxDropdownModal',
						filterProps: { options: getTypeOptions(t) },
					},
			  ]),
		{
			id: QUICK_LANE_COLUMNS.URL,
			label: t('workspace/views/quick-lane-overview___url'),
			visibleByDefault: true,
		},
		// Hide timestamps & author on mobile
		...(isMobileWidth()
			? []
			: [
					{
						id: QUICK_LANE_COLUMNS.AUTHOR,
						label: t('workspace/views/quick-lane-overview___aangemaakt-door'),
						sortable: true,
						dataType: 'string',
						visibleByDefault: true,
						filterType: 'MultiUserSelectDropdown',
					},
					{
						id: QUICK_LANE_COLUMNS.CREATED_AT,
						label: t('workspace/views/quick-lane-overview___aangemaakt-op'),
						sortable: true,
						dataType: 'dateTime',
						visibleByDefault: true,
						filterType: 'DateRangeDropdown',
					},
					{
						id: QUICK_LANE_COLUMNS.UPDATED_AT,
						label: t('workspace/views/quick-lane-overview___aangepast-op'),
						sortable: true,
						dataType: 'dateTime',
						visibleByDefault: true,
						filterType: 'DateRangeDropdown',
					},
			  ]),
	] as FilterableColumn[];

	// Data

	const fetchQuickLanes = useCallback(async () => {
		setLoadingInfo({ state: 'loading' });

		try {
			setQuickLanes([]);
			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(
				new CustomError('Failed to get admin quick_lanes for user', err, { user })
			);

			setLoadingInfo({
				state: 'error',
				message: t(
					'workspace/views/quick-lane-overview___het-ophalen-van-je-gedeelde-links-is-mislukt'
				),
			});
		}
	}, [user, setQuickLanes, setLoadingInfo, t, debouncedFilters]);

	// Lifecycle

	useEffect(() => {
		fetchQuickLanes();
	}, [fetchQuickLanes]);

	// Rendering

	const renderCell = (data: QuickLaneUrlObject, id: string) => (
		<QuickLaneFilterTableCell id={id} data={data} />
	);

	const renderTable = () => (
		<FilterTable
			columns={columns}
			data={quickLanes}
			dataCount={quickLanes.length}
			itemsPerPage={ITEMS_PER_PAGE}
			noContentMatchingFiltersMessage={
				loadingInfo.state === 'loaded'
					? t(
							'workspace/views/quick-lane-overview___er-werden-geen-gedeelde-links-gevonden-die-voldoen-aan-de-opgegeven-criteria'
					  )
					: ''
			}
			onTableStateChanged={(state) => {
				// NOTE: prevents recursion loop but hits theoretical performance
				if (JSON.stringify(filters) !== JSON.stringify(state)) {
					setFilters(state as QuickLaneOverviewFilterState);
				}
			}}
			renderCell={renderCell}
			renderNoResults={() => <h1>NoResults</h1>}
			searchTextPlaceholder={t(
				'workspace/views/quick-lane-overview___zoek-op-titel-of-naam-van-de-auteur'
			)}
			rowKey="id"
			variant="styled"
			isLoading={loadingInfo.state === 'loading'}
		/>
	);

	return (
		<AdminLayout
			pageTitle={t('admin/quick-lane/views/quick-lane-overview___gedeelde-links')}
			size="full-width"
		>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/quick-lane/views/quick-lane-overview___gedeelde-links-overview-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/quick-lane/views/quick-lane-overview___gedeelde-links-overview-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={[]}
					render={renderTable}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default QuickLaneOverview;
