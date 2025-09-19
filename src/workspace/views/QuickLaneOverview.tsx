import {
	FILTER_TABLE_QUERY_PARAM_CONFIG,
	type FilterableColumn,
	FilterTable,
	TableFilterType,
} from '@meemoo/admin-core-ui/dist/admin.mjs';
import { IconName, type MenuItemInfo, MoreOptionsDropdown } from '@viaa/avo2-components';
import { useAtomValue } from 'jotai';
import { isEqual } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import { commonUserAtom } from '../../authentication/authentication.store';
import { QuickLaneService } from '../../quick-lane/quick-lane.service';
import { ConfirmModal } from '../../shared/components/ConfirmModal/ConfirmModal';
import { type LoadingInfo } from '../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import QuickLaneFilterTableCell from '../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import { QuickLaneModal } from '../../shared/components/QuickLaneModal/QuickLaneModal';
import { QUICK_LANE_DEFAULTS, type QuickLaneColumn } from '../../shared/constants/quick-lane';
import { CustomError } from '../../shared/helpers/custom-error';
import { copyQuickLaneToClipboard } from '../../shared/helpers/generate-quick-lane-href';
import { isMobileWidth } from '../../shared/helpers/media-query';
import { getTypeOptions, isOrganisational, isPersonal } from '../../shared/helpers/quick-lane';
import { useDebounce } from '../../shared/hooks/useDebounce';
import { useTranslation } from '../../shared/hooks/useTranslation';
import {
	type QuickLaneFilters,
	QuickLaneFilterService,
} from '../../shared/services/quick-lane-filter-service';
import { ToastService } from '../../shared/services/toast-service';
import { type QuickLaneOverviewFilterState, type QuickLaneUrlObject } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../workspace.const';

import './QuickLaneOverview.scss';

// Typings

interface QuickLaneOverviewProps {
	numberOfItems: number;
}

enum QuickLaneAction {
	COPY = 'COPY',
	DELETE = 'DELETE',
}

// Component

const queryParamConfig = FILTER_TABLE_QUERY_PARAM_CONFIG([]);

export const QuickLaneOverview: FC<QuickLaneOverviewProps> = () => {
	const { tText, tHtml } = useTranslation();

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [quickLanes, setQuickLanes] = useState<QuickLaneUrlObject[]>([]);
	const [selected, setSelected] = useState<QuickLaneUrlObject | undefined>(undefined);
	const [quickLanesCount, setQuickLanesCount] = useState<number>(0);
	const [isQuickLaneModalOpen, setIsQuickLaneModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const commonUser = useAtomValue(commonUserAtom);

	// Set default sorting
	const [query, setQuery] = useQueryParams({
		sort_order: queryParamConfig.sort_order,
		sort_column: queryParamConfig.sort_column,
	});

	const [filters, setFilters] = useState<QuickLaneOverviewFilterState | undefined>(undefined);
	const debouncedFilters: QuickLaneOverviewFilterState | undefined = useDebounce(filters, 250);

	// Configuration

	const columns: FilterableColumn<QuickLaneColumn>[] = [
		{
			id: 'title',
			label: tText('workspace/views/quick-lane-overview___titel'),
			sortable: true,
			dataType: TableColumnDataType.string,
			visibleByDefault: true,
		},
		// Hide type, timestamps & author on mobile
		...(isMobileWidth()
			? []
			: [
					{
						id: 'content_label' as const,
						label: tText('workspace/views/quick-lane-overview___type'),
						sortable: true,
						dataType: TableColumnDataType.string,
						visibleByDefault: true,
						filterType: TableFilterType.CheckboxDropdownModal,
						filterProps: { options: getTypeOptions() },
					},

					...(isOrganisational(commonUser)
						? [
								{
									id: 'author' as const,
									label: tText(
										'workspace/views/quick-lane-overview___aangemaakt-door'
									),
									sortable: true,
									dataType: TableColumnDataType.string,
									visibleByDefault: true,
									filterType: TableFilterType.MultiUserSelectDropdown,
								},
						  ]
						: []),

					...[
						{
							id: 'created_at' as const,
							label: tText('workspace/views/quick-lane-overview___aangemaakt-op'),
							sortable: true,
							dataType: TableColumnDataType.dateTime,
							visibleByDefault: true,
							filterType: TableFilterType.DateRangeDropdown,
						},
						// Disabled due to: https://meemoo.atlassian.net/browse/AVO-1753?focusedCommentId=24892
						// {
						// 	id: 'updated_at' as const,
						// 	label: tText('workspace/views/quick-lane-overview___aangepast-op'),
						// 	sortable: true,
						// 	dataType: TableColumnDataType.dateTime,
						// 	visibleByDefault: true,
						// 	filterType: TableFilterType.DateRangeDropdown,
						// },
					],
			  ]),
		{
			id: 'action',
			sortable: false,
			visibleByDefault: true,
		},
	];

	// Data

	const fetchQuickLanes = useCallback(async () => {
		setLoadingInfo({ state: 'loading' });

		try {
			if (!commonUser?.profileId || debouncedFilters === undefined) {
				setLoadingInfo({
					state: 'error',
					message: tHtml(
						'workspace/views/quick-lane-overview___er-is-onvoldoende-informatie-beschikbaar-om-gedeelde-links-op-te-halen'
					),
				});
				return;
			}

			let params: QuickLaneFilters = {
				filterString: debouncedFilters.query,
				createdAt: debouncedFilters.created_at,
				updatedAt: debouncedFilters.updated_at,
				contentLabels: debouncedFilters.content_label,
				sortOrder: debouncedFilters.sort_order,
				sortColumn: debouncedFilters.sort_column,
				sortType: columns.find((column) => {
					return column.id === debouncedFilters.sort_column;
				})?.dataType as TableColumnDataType,
				limit: ITEMS_PER_PAGE,
				offset: debouncedFilters.page * ITEMS_PER_PAGE,
			};

			if (isOrganisational(commonUser)) {
				if (!commonUser.companyId) {
					setLoadingInfo({
						state: 'error',
						message: tHtml(
							'workspace/views/quick-lane-overview___de-huidige-gebruiker-is-niet-geassocieerd-met-een-organisatie'
						),
					});
					return;
				}

				// If the user has access to their entire organisation's quick_lane urls load them all, including their own
				params = {
					...params,
					companyIds: [commonUser.companyId],
					profileIds: debouncedFilters.author,
				};
			} else if (isPersonal(commonUser)) {
				if (!commonUser.profileId) {
					setLoadingInfo({
						state: 'error',
						message: tHtml(
							'workspace/views/quick-lane-overview___de-huidige-gebruiker-heeft-een-corrupt-profiel'
						),
					});
					return;
				}

				// If they do not have access to their organisation's but do have access to their own, change the params
				params = {
					...params,
					profileIds: [commonUser.profileId],
				};
			}

			const response = await QuickLaneFilterService.fetchFilteredQuickLanes(params);

			setQuickLanes(response.urls);
			setQuickLanesCount(response.count);

			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(
				new CustomError('Failed to get all quick_lanes for user', err, { commonUser })
			);

			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'workspace/views/quick-lane-overview___het-ophalen-van-je-gedeelde-links-is-mislukt'
				),
			});
		}
	}, [commonUser, setQuickLanes, setLoadingInfo, tText, debouncedFilters]); // eslint-disable-line

	const removeQuickLane = (id: QuickLaneUrlObject['id']) => {
		if (!commonUser?.profileId) {
			return;
		}

		try {
			QuickLaneService.removeQuickLanesById([id], commonUser.profileId).then(async () => {
				await fetchQuickLanes();

				ToastService.success(
					tHtml('workspace/views/quick-lane-overview___de-gedeelde-link-is-verwijderd')
				);
			});
		} catch (error) {
			console.error(error);

			ToastService.danger(
				tHtml(
					'workspace/views/quick-lane-overview___er-ging-iets-mis-bij-het-verwijderen-van-de-gedeelde-link'
				)
			);
		}

		setIsConfirmationModalOpen(false);
	};

	// Lifecycle

	useEffect(() => {
		fetchQuickLanes();
	}, [fetchQuickLanes]);

	useEffect(() => {
		setQuery({
			sort_column: query.sort_column || QUICK_LANE_DEFAULTS.sort_column,
			sort_order: query.sort_order || QUICK_LANE_DEFAULTS.sort_order,
		});
	}, []); // eslint-disable-line

	// Rendering

	const renderCell = (data: QuickLaneUrlObject, id: QuickLaneColumn) => (
		<QuickLaneFilterTableCell
			id={id}
			data={data}
			actions={(data) => {
				const items = [
					{
						icon: IconName.copy,
						id: QuickLaneAction.COPY,
						label: tText('workspace/views/quick-lane-overview___kopieer-link'),
					},
					{
						icon: IconName.delete,
						id: QuickLaneAction.DELETE,
						label: tText('workspace/views/quick-lane-overview___verwijder'),
					},
				] as (MenuItemInfo & { id: QuickLaneAction })[];

				return (
					data && (
						<MoreOptionsDropdown
							isOpen={data?.id === selected?.id}
							onOpen={() => setSelected(data as QuickLaneUrlObject)}
							onClose={() => {
								const isAModalOpen =
									isQuickLaneModalOpen || isConfirmationModalOpen;

								!isAModalOpen && setSelected(undefined);
							}}
							label={tText('workspace/views/quick-lane-overview___meer-acties')}
							menuItems={items}
							onOptionClicked={async (action) => {
								if (selected === undefined) {
									return;
								}

								switch (action.toString() as QuickLaneAction) {
									case QuickLaneAction.COPY:
										copyQuickLaneToClipboard(data.id);
										setSelected(undefined);
										break;

									case QuickLaneAction.DELETE:
										setIsConfirmationModalOpen(true);
										break;

									default:
										break;
								}
							}}
						/>
					)
				);
			}}
		/>
	);

	return (
		<>
			<FilterTable
				columns={columns}
				data={quickLanes}
				dataCount={quickLanesCount}
				itemsPerPage={ITEMS_PER_PAGE}
				noContentMatchingFiltersMessage={
					loadingInfo.state === 'loaded'
						? tText(
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
				renderCell={renderCell as any}
				renderNoResults={() => <h1>NoResults</h1>}
				searchTextPlaceholder={tText(
					'workspace/views/quick-lane-overview___zoek-op-titel-of-naam-van-de-auteur'
				)}
				rowKey="id"
				variant="styled"
				isLoading={loadingInfo.state === 'loading'}
				hideTableColumnsButton // Hidden due to: https://meemoo.atlassian.net/browse/AVO-1753?focusedCommentId=24892
				showCheckboxes={false}
			/>

			<QuickLaneModal
				modalTitle={tHtml('workspace/views/quick-lane-overview___gedeelde-link-aanpassen')}
				isOpen={isQuickLaneModalOpen}
				content={selected?.content}
				content_label={selected?.content_label}
				onClose={async () => {
					setIsQuickLaneModalOpen(false);
					setSelected(undefined);
					await fetchQuickLanes();
				}}
			/>

			<ConfirmModal
				title={tText(
					'workspace/views/quick-lane-overview___ben-je-zeker-dat-je-deze-gedeelde-link-wilt-verwijderen'
				)}
				body={tText(
					'workspace/views/quick-lane-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
				)}
				isOpen={isConfirmationModalOpen}
				onClose={() => {
					setIsConfirmationModalOpen(false);
					setSelected(undefined);
				}}
				confirmCallback={async () => selected && removeQuickLane(selected.id)}
			/>
		</>
	);
};
