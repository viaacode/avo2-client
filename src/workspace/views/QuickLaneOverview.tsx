import { IconName, MenuItemInfo, MoreOptionsDropdown } from '@viaa/avo2-components';
import { isEqual } from 'lodash';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { useQueryParams } from 'use-query-params';

import FilterTable, {
	FilterableColumn,
} from '../../admin/shared/components/FilterTable/FilterTable';
import { FILTER_TABLE_QUERY_PARAM_CONFIG } from '../../admin/shared/components/FilterTable/FilterTable.const';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { QuickLaneService } from '../../quick-lane/quick-lane.service';
import { DeleteObjectModal, LoadingInfo } from '../../shared/components';
import QuickLaneFilterTableCell from '../../shared/components/QuickLaneFilterTableCell/QuickLaneFilterTableCell';
import QuickLaneModal from '../../shared/components/QuickLaneModal/QuickLaneModal';
import { QUICK_LANE_DEFAULTS, QuickLaneColumn } from '../../shared/constants/quick-lane';
import { CustomError, isMobileWidth } from '../../shared/helpers';
import { copyQuickLaneToClipboard } from '../../shared/helpers/generate-quick-lane-href';
import { getTypeOptions, isOrganisational, isPersonal } from '../../shared/helpers/quick-lane';
import { useDebounce } from '../../shared/hooks/useDebounce';
import useTranslation from '../../shared/hooks/useTranslation';
import {
	QuickLaneFilters,
	QuickLaneFilterService,
} from '../../shared/services/quick-lane-filter-service';
import { ToastService } from '../../shared/services/toast-service';
import { QuickLaneOverviewFilterState, QuickLaneUrlObject } from '../../shared/types';
import { TableColumnDataType } from '../../shared/types/table-column-data-type';
import { ITEMS_PER_PAGE } from '../workspace.const';

import './QuickLaneOverview.scss';

// Typings

interface QuickLaneOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
}

// Component

const queryParamConfig = FILTER_TABLE_QUERY_PARAM_CONFIG([]);

const QuickLaneOverview: FunctionComponent<QuickLaneOverviewProps> = ({ user }) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [quickLanes, setQuickLanes] = useState<QuickLaneUrlObject[]>([]);
	const [selected, setSelected] = useState<QuickLaneUrlObject | undefined>(undefined);
	const [quickLanesCount, setQuickLanesCount] = useState<number>(0);
	const [isQuickLaneModalOpen, setIsQuickLaneModalOpen] = useState(false);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);
	const [loadSelectedError, setLoadSelectedError] = useState<ReactNode | undefined>(undefined);

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
						filterType: 'CheckboxDropdownModal' as const,
						filterProps: { options: getTypeOptions() },
					},

					...(isOrganisational(user)
						? [
								{
									id: 'author' as const,
									label: tText(
										'workspace/views/quick-lane-overview___aangemaakt-door'
									),
									sortable: true,
									dataType: TableColumnDataType.string,
									visibleByDefault: true,
									filterType: 'MultiUserSelectDropdown' as const,
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
							filterType: 'DateRangeDropdown' as const,
						},
						// Disabled due to: https://meemoo.atlassian.net/browse/AVO-1753?focusedCommentId=24892
						// {
						// 	id: 'updated_at' as const,
						// 	label: tText('workspace/views/quick-lane-overview___aangepast-op'),
						// 	sortable: true,
						// 	dataType: TableColumnDataType.dateTime,
						// 	visibleByDefault: true,
						// 	filterType: 'DateRangeDropdown' as const,
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
			if (!user.profile || debouncedFilters === undefined) {
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

			if (isOrganisational(user)) {
				if (!user.profile.company_id) {
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
					companyIds: [user.profile.company_id],
					profileIds: debouncedFilters.author,
				};
			} else if (isPersonal(user)) {
				if (!user.profile.id) {
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
					profileIds: [user.profile.id],
				};
			}

			const response = await QuickLaneFilterService.fetchFilteredQuickLanes(params);

			setQuickLanes(response.urls);
			setQuickLanesCount(response.count);

			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(new CustomError('Failed to get all quick_lanes for user', err, { user }));

			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'workspace/views/quick-lane-overview___het-ophalen-van-je-gedeelde-links-is-mislukt'
				),
			});
		}
	}, [user, setQuickLanes, setLoadingInfo, tText, debouncedFilters]); // eslint-disable-line

	const fetchQuickLaneDetail = async (selected: QuickLaneUrlObject) => {
		const details = await QuickLaneService.fetchQuickLaneById(selected.id);

		if (details.content) {
			setSelected(details);
		} else {
			setLoadSelectedError(
				tText('workspace/views/quick-lane-overview___de-collectie-is-niet-gevonden')
			);
		}
	};

	const removeQuickLane = (id: QuickLaneUrlObject['id']) => {
		if (!user.profile?.id) {
			return;
		}

		try {
			QuickLaneService.removeQuickLanesById([id], user.profile?.id).then(async () => {
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
				type actions = 'edit' | 'copy' | 'delete';

				const items = [
					{
						icon: IconName.edit,
						id: 'edit',
						label: tText('workspace/views/quick-lane-overview___bewerk'),
					},
					{
						icon: IconName.copy,
						id: 'copy',
						label: tText('workspace/views/quick-lane-overview___kopieer-link'),
					},
					{
						icon: IconName.delete,
						id: 'delete',
						label: tText('workspace/views/quick-lane-overview___verwijder'),
					},
				] as (MenuItemInfo & { id: actions })[];

				return (
					data && (
						<MoreOptionsDropdown
							isOpen={data?.id === selected?.id}
							onOpen={() => setSelected(data)}
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

								switch (action.toString() as actions) {
									case 'edit':
										await fetchQuickLaneDetail(selected);
										setIsQuickLaneModalOpen(true);
										break;

									case 'copy':
										copyQuickLaneToClipboard(data.id);
										setSelected(undefined);
										break;

									case 'delete':
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
			/>

			<QuickLaneModal
				modalTitle={tHtml('workspace/views/quick-lane-overview___gedeelde-link-aanpassen')}
				isOpen={isQuickLaneModalOpen}
				content={selected?.content}
				content_label={selected?.content_label}
				onClose={() => {
					setIsQuickLaneModalOpen(false);
					setSelected(undefined);
					fetchQuickLanes();
				}}
				error={loadSelectedError}
			/>

			<DeleteObjectModal
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

export default QuickLaneOverview;
