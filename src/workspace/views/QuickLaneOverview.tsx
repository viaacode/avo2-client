import { orderBy } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Button, Pagination, Spacer, Table, TableColumn } from '@viaa/avo2-components';
import { UserSchema } from '@viaa/avo2-types/types/user';

import { DefaultSecureRouteProps } from '../../authentication/components/SecuredRoute';
import { PermissionName, PermissionService } from '../../authentication/helpers/permission-service';
import { APP_PATH } from '../../constants';
import { ErrorView } from '../../error/views';
import { isCollection, isItem } from '../../quick-lane/quick-lane.helpers';
import { LoadingErrorLoadedComponent, LoadingInfo } from '../../shared/components';
import QuickLaneLink from '../../shared/components/QuickLaneLink/QuickLaneLink';
import { CustomError, formatDate, formatTimestamp, isMobileWidth } from '../../shared/helpers';
import { QuickLaneUrlObject } from '../../shared/types';
import { ITEMS_PER_PAGE } from '../workspace.const';
import { WorkspaceService } from '../workspace.service';

import './QuickLaneOverview.scss';

// Typings

interface QuickLaneOverviewProps extends DefaultSecureRouteProps {
	numberOfItems: number;
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

// Component

const QuickLaneOverview: FunctionComponent<QuickLaneOverviewProps> = ({
	history,
	user,
	numberOfItems,
}) => {
	const [t] = useTranslation();

	// State
	const [quickLanes, setQuickLanes] = useState<QuickLaneUrlObject[]>([]);
	const [sortColumn, setSortColumn] = useState<keyof QuickLaneUrlObject>('created_at');
	const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [paginated, setPaginated] = useState<QuickLaneUrlObject[]>([]);

	const columns: TableColumn[] = [
		{
			id: QUICKLANE_COLUMNS.TITLE,
			label: t('workspace/views/quick-lane-overview___titel'),
			sortable: true,
			dataType: 'string',
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
					},
			  ]),
		{
			id: QUICKLANE_COLUMNS.URL,
			label: t('workspace/views/quick-lane-overview___url'),
		},
		// Hide timestamps & author on mobile
		...(isMobileWidth()
			? []
			: [
					...(isOrganisational(user)
						? [
								{
									id: QUICKLANE_COLUMNS.AUTHOR,
									label: t('Aangemaakt door'),
									sortable: true,
									dataType: 'string',
								},
						  ]
						: []),
					...[
						{
							id: QUICKLANE_COLUMNS.CREATED_AT,
							label: t('workspace/views/quick-lane-overview___aangemaakt-op'),
							sortable: true,
							dataType: 'dateTime',
						},
						{
							id: QUICKLANE_COLUMNS.UPDATED_AT,
							label: t('workspace/views/quick-lane-overview___aangepast-op'),
							sortable: true,
							dataType: 'dateTime',
						},
					],
			  ]),
	] as TableColumn[];

	const fetchQuickLanes = useCallback(async () => {
		try {
			if (!user.profile || user.profile.id === undefined) {
				return;
			}

			// Define the original promise
			let promise: Promise<QuickLaneUrlObject[]> | undefined;

			if (isOrganisational(user)) {
				if (!user.profile.company_id) {
					return;
				}

				// If the user has access to their entire organisation's quick_lane urls load them all, including their own
				promise = WorkspaceService.fetchQuickLanesByCompanyId(user.profile.company_id);
			} else if (isPersonal(user)) {
				// If they do not have access to their organisation's but do have access to their own, change the promise
				promise = WorkspaceService.fetchQuickLanesByOwnerId(user.profile.id);
			}

			// Finally, resolve the promise
			if (promise) {
				setQuickLanes(await promise);
				setLoadingInfo({ state: 'loaded' });
			}
		} catch (err) {
			console.error(new CustomError('Failed to get all quick_lanes for user', err, { user }));

			setLoadingInfo({
				state: 'error',
				message: t(
					'workspace/views/quick-lane-overview___het-ophalen-van-je-gedeelde-links-is-mislukt'
				),
			});
		}
	}, [user, setQuickLanes, setLoadingInfo, t]);

	useEffect(() => {
		fetchQuickLanes();
	}, [fetchQuickLanes]);

	const updatePaginatedBookmarks = useCallback(() => {
		setPaginated(
			orderBy(quickLanes, [sortColumn], [sortOrder]).slice(
				ITEMS_PER_PAGE * page,
				ITEMS_PER_PAGE * (page + 1)
			)
		);
	}, [setPaginated, sortColumn, sortOrder, page, quickLanes]);

	useEffect(updatePaginatedBookmarks, [updatePaginatedBookmarks]);

	// TODO: Make shared function because also used in assignments / bookmarks / ...
	const onClickColumn = (columnId: keyof QuickLaneUrlObject) => {
		if (sortColumn === columnId) {
			// Change column sort order
			setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
		} else {
			// Initial column sort order
			setSortColumn(columnId);
			setSortOrder('asc');
		}
		setPage(0);
	};

	// Render functions
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

	const renderTable = () => (
		<>
			<Table
				columns={columns}
				data={paginated}
				emptyStateMessage={t(
					'workspace/views/quick-lane-overview___je-hebt-nog-geen-gedeelde-links-aangemaakt'
				)}
				renderCell={renderCell}
				rowKey="contentId"
				variant="styled"
				onColumnClick={onClickColumn as any}
				sortColumn={sortColumn}
				sortOrder={sortOrder}
			/>
			<Spacer margin="top-large">
				<Pagination
					pageCount={Math.ceil(numberOfItems / ITEMS_PER_PAGE)}
					currentPage={page}
					onPageChange={setPage}
				/>
			</Spacer>
		</>
	);

	const renderEmptyFallback = () => (
		<ErrorView
			icon="link-2"
			message={t(
				'workspace/views/quick-lane-overview___je-hebt-nog-geen-gedeelde-links-aangemaakt'
			)}
		>
			<p>
				{t(
					'workspace/views/quick-lane-overview___een-gedeelde-link-kan-je-gebruiken-om-makkelijk-en-snel-fragmenten-of-collecties-te-delen-zonder-tijdslimiet'
				)}
			</p>
			<Spacer margin="top">
				<Button
					type="primary"
					icon="search"
					label={t('workspace/views/quick-lane-overview___zoek-een-item')}
					title={t(
						'workspace/views/quick-lane-overview___zoek-een-item-en-maak-een-gedeelde-link-er-naartoe'
					)}
					onClick={() => history.push(APP_PATH.SEARCH.route)}
				/>
			</Spacer>
		</ErrorView>
	);

	const renderQuickLanes = () => (quickLanes.length > 0 ? renderTable() : renderEmptyFallback());

	return (
		<LoadingErrorLoadedComponent
			loadingInfo={loadingInfo}
			dataObject={quickLanes}
			render={renderQuickLanes}
		/>
	);
};

export default QuickLaneOverview;
