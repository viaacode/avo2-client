import { FilterTable } from '@meemoo/admin-core-ui/admin';
import { Button, ButtonToolbar, IconName, Spacer } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import { get, isNil } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { APP_PATH, GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views/ErrorView';
import { OrderDirection } from '../../../search/search.const';
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { buildLink } from '../../../shared/helpers/build-link';
import { CustomError } from '../../../shared/helpers/custom-error';
import { formatDate } from '../../../shared/helpers/formatters';
import { navigate } from '../../../shared/helpers/link';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { useTranslation } from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { ADMIN_PATH } from '../../admin.const';
import { getDateRangeFilters, getQueryFilter } from '../../shared/helpers/filters';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import {
	GET_INTERACTIVE_TOUR_OVERVIEW_TABLE_COLS,
	INTERACTIVE_TOUR_PATH,
	ITEMS_PER_PAGE,
} from '../interactive-tour.const';
import { InteractiveTourService } from '../interactive-tour.service';
import {
	type InteractiveTour,
	type InteractiveTourOverviewTableCols,
	type InteractiveTourTableState,
} from '../interactive-tour.types';

export const InteractiveTourOverview: FC = () => {
	const { tText, tHtml } = useTranslation();
	const navigateFunc = useNavigate();

	const [interactiveTourIdToDelete, setInteractiveTourIdToDelete] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [interactiveTours, setInteractiveTours] = useState<InteractiveTour[] | null>(null);
	const [interactiveTourCount, setInteractiveTourCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<InteractiveTourTableState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const fetchInteractiveTours = useCallback(async () => {
		setIsLoading(true);
		const generateWhereObject = (filters: Partial<InteractiveTourTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(filters.query, (queryWildcard: string) => [
					{ name: { _ilike: queryWildcard } },
					{ page: { _ilike: queryWildcard } },
				])
			);
			andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
			return { _and: andFilters };
		};

		try {
			const [interactiveToursTemp, interactiveTourCountTemp] =
				await InteractiveTourService.fetchInteractiveTours(
					tableState.page || 0,
					// We need to substitute page with page_id, because the filter table state already contains a prop "page" for pagination
					(tableState.sort_column || 'created_at').replace('page_id', 'page') as any,
					tableState.sort_order || OrderDirection.desc,
					generateWhereObject(tableState)
				);
			setInteractiveTours(interactiveToursTemp);
			setInteractiveTourCount(interactiveTourCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch interactive tours from graphql', err, {
					tableState,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml(
					'admin/interactive-tour/views/interactive-tour-overview___het-ophalen-van-de-interactive-tours-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [tHtml, tableState]);

	useEffect(() => {
		fetchInteractiveTours();
	}, [fetchInteractiveTours]);

	useEffect(() => {
		if (interactiveTours && !isNil(interactiveTourCount)) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [interactiveTours, interactiveTourCount]);

	const handleDelete = async () => {
		try {
			setIsConfirmModalOpen(false);
			if (!interactiveTourIdToDelete) {
				ToastService.danger(
					tHtml(
						'admin/interactive-tour/views/interactive-tour-overview___het-verwijderen-van-de-interactieve-tour-is-mislukt-probeer-de-pagina-te-herladen'
					)
				);
				return;
			}

			await InteractiveTourService.deleteInteractiveTour(interactiveTourIdToDelete);
			await fetchInteractiveTours();
			ToastService.success(
				tHtml(
					'admin/interactive-tour/views/interactive-tour-overview___de-interactieve-tour-is-verwijdert'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete user group', err, {
					interactiveTourIdToDelete,
					query: 'DELETE_INTERACTIVE_TOUR',
				})
			);
			ToastService.danger(
				tHtml(
					'admin/interactive-tour/views/interactive-tour-overview___het-verwijderen-van-de-interactieve-tour-is-mislukt'
				)
			);
		}
	};

	const openModal = (interactiveTourId: number | undefined): void => {
		if (isNil(interactiveTourId)) {
			ToastService.danger(
				tHtml(
					'admin/interactive-tour/views/interactive-tour-overview___de-interactieve-tour-kon-niet-worden-verwijdert-probeer-de-pagina-te-herladen'
				)
			);
			return;
		}
		setInteractiveTourIdToDelete(interactiveTourId);
		setIsConfirmModalOpen(true);
	};

	const renderTableCell = (
		rowData: InteractiveTour,
		columnId: InteractiveTourOverviewTableCols
	) => {
		switch (columnId) {
			case 'name':
				return (
					<Link to={buildLink(ADMIN_PATH.INTERACTIVE_TOUR_DETAIL, { id: rowData.id })}>
						{isNil(rowData.name) ? '-' : rowData.name}
					</Link>
				);

			case 'page_id':
				return (
					<div>
						<span>{rowData.page_id}</span>
						<br />
						<span className="u-text-muted">
							{get(APP_PATH, [rowData.page_id, 'route'], '-')}
						</span>
					</div>
				);

			case 'created_at':
			case 'updated_at':
				return formatDate(rowData[columnId]) || '-';

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<ButtonToolbar>
						<Button
							type="secondary"
							icon={IconName.eye}
							onClick={() =>
								navigate(
									navigateFunc,
									INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_DETAIL,
									{
										id: rowData.id,
									}
								)
							}
							title={tText(
								'admin/interactive-tour/views/interactive-tour-overview___bekijk-de-rondleiding-detail-pagina'
							)}
							ariaLabel={tText(
								'admin/interactive-tour/views/interactive-tour-overview___bekijk-de-rondleiding-detail-pagina'
							)}
						/>
						<Button
							icon={IconName.edit}
							onClick={() =>
								navigate(
									navigateFunc,
									INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_EDIT,
									{
										id: rowData.id,
									}
								)
							}
							size="small"
							title={tText(
								'admin/interactive-tour/views/interactive-tour-overview___bewerk-de-rondleiding'
							)}
							ariaLabel={tText(
								'admin/interactive-tour/views/interactive-tour-overview___bewerk-de-rondleiding'
							)}
							type="secondary"
						/>
						<Button
							icon={IconName.delete}
							onClick={() => openModal(rowData.id)}
							size="small"
							title={tText(
								'admin/interactive-tour/views/interactive-tour-overview___verwijder-de-rondleiding'
							)}
							ariaLabel={tText(
								'admin/interactive-tour/views/interactive-tour-overview___verwijder-de-rondleiding'
							)}
							type="danger-hover"
						/>
					</ButtonToolbar>
				);

			default:
				return isNil(rowData[columnId]) ? '-' : rowData[columnId];
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={tHtml(
					'admin/interactive-tour/views/interactive-tour-overview___er-zijn-nog-geen-interactieve-tours-aangemaakt'
				)}
			>
				<p>
					{tHtml(
						'admin/interactive-tour/views/interactive-tour-overview___beschrijving-hoe-interactieve-tours-toe-voegen'
					)}
				</p>
				<Spacer margin="top">
					<Button
						icon={IconName.plus}
						label={tText(
							'admin/interactive-tour/views/interactive-tour-overview___interactieve-tour-aanmaken'
						)}
						onClick={() => navigateFunc(INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		);
	};

	const renderInteractiveTourPageBody = () => {
		if (!interactiveTours) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={GET_INTERACTIVE_TOUR_OVERVIEW_TABLE_COLS()}
					data={interactiveTours || []}
					dataCount={interactiveTourCount}
					renderCell={(rowData: InteractiveTour, columnId: string) =>
						renderTableCell(rowData, columnId as InteractiveTourOverviewTableCols)
					}
					searchTextPlaceholder={tText(
						'admin/interactive-tour/views/interactive-tour-overview___zoek-op-label-beschrijving'
					)}
					renderNoResults={renderNoResults}
					onTableStateChanged={setTableState}
					itemsPerPage={ITEMS_PER_PAGE}
					noContentMatchingFiltersMessage={tText(
						'admin/interactive-tour/views/interactive-tour-overview___er-zijn-geen-interactieve-tours-die-voldoen-aan-de-filters'
					)}
					isLoading={isLoading}
					showCheckboxes={false}
				/>
				<ConfirmModal
					confirmCallback={handleDelete}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</>
		);
	};

	return (
		<PermissionGuard permissions={[PermissionName.EDIT_INTERACTIVE_TOURS]}>
			<AdminLayout
				pageTitle={tText(
					'admin/interactive-tour/views/interactive-tour-overview___interactieve-tours'
				)}
				size="full-width"
			>
				<AdminLayoutTopBarRight>
					<Button
						label={tText(
							'admin/interactive-tour/views/interactive-tour-overview___interactieve-tour-toevoegen'
						)}
						onClick={() => {
							redirectToClientPage(
								INTERACTIVE_TOUR_PATH.INTERACTIVE_TOUR_CREATE,
								navigateFunc
							);
						}}
					/>
				</AdminLayoutTopBarRight>
				<AdminLayoutBody>
					<Helmet>
						<title>
							{GENERATE_SITE_TITLE(
								tText(
									'admin/interactive-tour/views/interactive-tour-overview___interactieve-rondleiding-beheer-overview-pagina-titel'
								)
							)}
						</title>
						<meta
							name="description"
							content={tText(
								'admin/interactive-tour/views/interactive-tour-overview___interactieve-rondleiding-beheer-overview-pagina-beschrijving'
							)}
						/>
					</Helmet>
					<LoadingErrorLoadedComponent
						loadingInfo={loadingInfo}
						dataObject={interactiveTours}
						render={renderInteractiveTourPageBody}
					/>
				</AdminLayoutBody>
			</AdminLayout>
		</PermissionGuard>
	);
};
