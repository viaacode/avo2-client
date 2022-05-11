import { isEqual } from 'lodash';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import FilterTable, {
	FilterableColumn,
} from '../../admin/shared/components/FilterTable/FilterTable';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { LoadingInfo } from '../../shared/components';
import QuickLaneFilterTableCell from '../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { QUICK_LANE_COLUMNS } from '../../shared/constants/quick-lane';
import { CustomError, isMobileWidth } from '../../shared/helpers';
import { getTypeOptions, isOrganisational, isPersonal } from '../../shared/helpers/quick-lane';
import { useDebounce } from '../../shared/hooks';
import {
	QuickLaneFilters,
	QuickLaneFilterService,
} from '../../shared/services/quick-lane-filter-service';
import { QuickLaneOverviewFilterState, QuickLaneUrlObject } from '../../shared/types';
import { ITEMS_PER_PAGE } from '../workspace.const';

import './QuickLaneOverview.scss';

// Typings

interface QuickLaneOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
}

// Component

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
		// Hide timestamps & author on mobile
		...(isMobileWidth()
			? []
			: [
					...(isOrganisational(user)
						? [
								{
									id: QUICK_LANE_COLUMNS.AUTHOR,
									label: t(
										'workspace/views/quick-lane-overview___aangemaakt-door'
									),
									sortable: true,
									dataType: 'string',
									visibleByDefault: true,
									filterType: 'MultiUserSelectDropdown',
								},
						  ]
						: []),
					...[
						{
							id: QUICK_LANE_COLUMNS.CREATED_AT,
							label: t('workspace/views/quick-lane-overview___aangemaakt-op'),
							sortable: true,
							dataType: 'dateTime',
							visibleByDefault: true,
							filterType: 'DateRangeDropdown',
						},
						// Disabled due to: https://meemoo.atlassian.net/browse/AVO-1753?focusedCommentId=24892
						// {
						// 	id: QUICK_LANE_COLUMNS.UPDATED_AT,
						// 	label: t('workspace/views/quick-lane-overview___aangepast-op'),
						// 	sortable: true,
						// 	dataType: 'dateTime',
						// 	visibleByDefault: true,
						// 	filterType: 'DateRangeDropdown',
						// },
					],
			  ]),
	] as FilterableColumn[];

	// Data

	const fetchQuickLanes = useCallback(async () => {
		setLoadingInfo({ state: 'loading' });

		try {
			if (!user.profile || debouncedFilters === undefined) {
				setLoadingInfo({
					state: 'error',
					message: t(
						'workspace/views/quick-lane-overview___er-is-onvoldoende-informatie-beschikbaar-om-gedeelde-links-op-te-halen'
					),
				});
				return;
			}

			let params: QuickLaneFilters = {
				filterString: debouncedFilters?.query,
				createdAt: debouncedFilters?.created_at,
				updatedAt: debouncedFilters?.updated_at,
				contentLabels: debouncedFilters?.content_label,
				sortOrder: debouncedFilters?.sort_order,
				sortColumn: debouncedFilters?.sort_column,
				sortType: columns.find((column) => {
					return column.id === debouncedFilters?.sort_column;
				})?.dataType,
			};

			if (isOrganisational(user)) {
				if (!user.profile.company_id) {
					setLoadingInfo({
						state: 'error',
						message: t(
							'workspace/views/quick-lane-overview___de-huidige-gebruiker-is-niet-geassocieerd-met-een-organisatie'
						),
					});
					return;
				}

				// If the user has access to their entire organisation's quick_lane urls load them all, including their own
				params = {
					...params,
					companyIds: [user.profile.company_id],
					profileIds: debouncedFilters?.author,
				};
			} else if (isPersonal(user)) {
				if (!user.profile.id) {
					setLoadingInfo({
						state: 'error',
						message: t(
							'workspace/views/quick-lane-overview___de-huidige-gebruiker-heeft-een-corrupt-profiel'
						),
					});
					return;
				}

				// If they do not have access to their organisation's but do have access to their own, change the params
				params = {
					...params,
					profileIds: [user.profile.id],
				};
			}

			setQuickLanes(await QuickLaneFilterService.fetchFilteredQuickLanes(params));
			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(new CustomError('Failed to get all quick_lanes for user', err, { user }));

			setLoadingInfo({
				state: 'error',
				message: t(
					'workspace/views/quick-lane-overview___het-ophalen-van-je-gedeelde-links-is-mislukt'
				),
			});
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user, setQuickLanes, setLoadingInfo, t, debouncedFilters]);

	// Lifecycle

	useEffect(() => {
		fetchQuickLanes();
	}, [fetchQuickLanes]);

	// Rendering

	const renderCell = (data: QuickLaneUrlObject, id: string) => (
		<QuickLaneFilterTableCell id={id} data={data} />
	);

	return (
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
				if (!isEqual(filters, state)) {
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
			hideTableColumnsButton // Hidden due to: https://meemoo.atlassian.net/browse/AVO-1753?focusedCommentId=24892
		/>
	);
};

export default QuickLaneOverview;
