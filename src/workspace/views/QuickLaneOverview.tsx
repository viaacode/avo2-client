import { TFunction } from 'i18next';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { AssignmentContentLabel } from '@viaa/avo2-types/types/assignment';
import { SearchOrderDirection } from '@viaa/avo2-types/types/search';
import { UserSchema } from '@viaa/avo2-types/types/user';

import FilterTable, {
	FilterableColumn,
} from '../../admin/shared/components/FilterTable/FilterTable';
import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { isCollection, isItem } from '../../quick-lane/quick-lane.helpers';
import { CheckboxOption, LoadingInfo } from '../../shared/components';
import { DateRange } from '../../shared/components/DateRangeDropdown/DateRangeDropdown';
import QuickLaneLink from '../../shared/components/QuickLaneLink/QuickLaneLink';
import { CustomError, formatDate, formatTimestamp, isMobileWidth } from '../../shared/helpers';
import { useDebounce } from '../../shared/hooks';
import { QuickLaneUrlObject } from '../../shared/types';
import { ITEMS_PER_PAGE } from '../workspace.const';
import { QuickLaneFilters, WorkspaceService } from '../workspace.service';

import './QuickLaneOverview.scss';

// Typings

interface QuickLaneOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
}

interface QuickLaneOverviewFilterState {
	author: string[];
	columns: any[];
	content_label: AssignmentContentLabel[];
	created_at?: DateRange;
	page: number;
	query?: string;
	sort_column?: string;
	sort_order?: SearchOrderDirection;
	updated_at?: DateRange;
}

// Constants

const QUICKLANE_COLUMNS = {
	TITLE: 'title',
	URL: 'url',
	CREATED_AT: 'created_at',
	UPDATED_AT: 'updated_at',
	CONTENT_LABEL: 'content_label',
	AUTHOR: 'author',
};

// Helpers

const isOrganisational = (user: UserSchema): boolean => {
	return PermissionService.hasAtLeastOnePerm(user, [
		PermissionName.VIEW_OWN_ORGANISATION_QUICK_LANE_OVERVIEW,
	]);
};

const isPersonal = (user: UserSchema): boolean => {
	return PermissionService.hasAtLeastOnePerm(user, [
		PermissionName.VIEW_PERSONAL_QUICK_LANE_OVERVIEW,
	]);
};

const getTypeOptions = (t: TFunction): CheckboxOption[] => {
	const translations: {
		[x in AssignmentContentLabel]?: string;
	} = {
		ITEM: t('workspace/views/quick-lane-overview___item'),
		COLLECTIE: t('workspace/views/quick-lane-overview___collectie'),
	};

	const options: AssignmentContentLabel[] = ['ITEM', 'COLLECTIE'];

	return options.map((label) => {
		return {
			checked: false,
			id: label,
			label: translations[label] || '',
		};
	});
};

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
			id: QUICKLANE_COLUMNS.TITLE,
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
						id: QUICKLANE_COLUMNS.CONTENT_LABEL,
						label: t('workspace/views/quick-lane-overview___type'),
						sortable: true,
						dataType: 'string',
						visibleByDefault: true,
						filterType: 'CheckboxDropdownModal',
						filterProps: { options: getTypeOptions(t) },
					},
			  ]),
		{
			id: QUICKLANE_COLUMNS.URL,
			label: t('workspace/views/quick-lane-overview___url'),
			visibleByDefault: true,
		},
		// Hide timestamps & author on mobile
		...(isMobileWidth()
			? []
			: [
					...(isOrganisational(user)
						? [
								{
									id: QUICKLANE_COLUMNS.AUTHOR,
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
							id: QUICKLANE_COLUMNS.CREATED_AT,
							label: t('workspace/views/quick-lane-overview___aangemaakt-op'),
							sortable: true,
							dataType: 'dateTime',
							visibleByDefault: true,
							filterType: 'DateRangeDropdown',
						},
						{
							id: QUICKLANE_COLUMNS.UPDATED_AT,
							label: t('workspace/views/quick-lane-overview___aangepast-op'),
							sortable: true,
							dataType: 'dateTime',
							visibleByDefault: true,
							filterType: 'DateRangeDropdown',
						},
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

			setQuickLanes(await WorkspaceService.fetchFilteredQuickLanes(params));
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
	}, [user, setQuickLanes, setLoadingInfo, t, debouncedFilters]);

	// Lifecycle

	useEffect(() => {
		fetchQuickLanes();
	}, [fetchQuickLanes]);

	// Rendering

	const renderCell = (data: QuickLaneUrlObject, id: string) => {
		switch (id) {
			case QUICKLANE_COLUMNS.TITLE:
				return data.title.length <= 0 ? (
					<span className="u-text-muted">
						{t('workspace/views/quick-lane-overview___geen')}
					</span>
				) : (
					data.title
				);

			case QUICKLANE_COLUMNS.CONTENT_LABEL:
				if (isCollection(data)) {
					return t('workspace/views/quick-lane-overview___collectie');
				}

				if (isItem(data)) {
					return t('workspace/views/quick-lane-overview___item');
				}

				return t('workspace/views/quick-lane-overview___unknown-type');

			case QUICKLANE_COLUMNS.URL:
				return <QuickLaneLink id={data.id} /*label={`${data.id.slice(0, 8)}...`}*/ />;

			case QUICKLANE_COLUMNS.AUTHOR:
				return data.owner?.usersByuserId.full_name || '-';

			case QUICKLANE_COLUMNS.CREATED_AT:
			case QUICKLANE_COLUMNS.UPDATED_AT:
				const date = data[id as 'created_at' | 'updated_at'];
				return <span title={formatTimestamp(date)}>{formatDate(date)}</span>;

			default:
				return null;
		}
	};

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
};

export default QuickLaneOverview;
