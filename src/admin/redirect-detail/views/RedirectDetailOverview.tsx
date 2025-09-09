import { FilterTable } from '@meemoo/admin-core-ui/dist/admin.mjs';
import { Button, ButtonToolbar, IconName, Spacer } from '@viaa/avo2-components';
import type { SearchOrderDirection } from '@viaa/avo2-types/types/search';
import { isEqual, isNil } from 'lodash-es';
import React, { type FC, useCallback, useEffect, useState } from 'react';
import { Helmet } from 'react-helmet';
import { Link } from 'react-router-dom';

import { type DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { OrderDirection } from '../../../search/search.const';
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import {
	LoadingErrorLoadedComponent,
	type LoadingInfo,
} from '../../../shared/components/LoadingErrorLoadedComponent/LoadingErrorLoadedComponent';
import { CustomError } from '../../../shared/helpers/custom-error';
import { formatDate } from '../../../shared/helpers/formatters';
import { navigate } from '../../../shared/helpers/link';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import { mapTechnicalPath, PROXY_PATH_SHORTCUT } from '../helpers/map-technical-path';
import { useDeleteRedirectDetail } from '../hooks/useDeleteRedirectDetail';
import {
	GET_REDIRECT_DETAIL_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
	REDIRECT_DETAIL_PATH,
	REDIRECT_DETAIL_TYPE_OPTIONS,
} from '../redirect-detail.const';
import { RedirectDetailService } from '../redirect-detail.service';
import {
	type RedirectDetail,
	type RedirectDetailOverviewFilterState,
	type RedirectDetailOverviewTableCols,
} from '../redirect-detail.types';

type RedirectsOverviewProps = DefaultSecureRouteProps;

const RedirectDetailOverview: FC<RedirectsOverviewProps> = ({ history }) => {
	const { tText, tHtml } = useTranslation();

	// State
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [redirectDetails, setRedirectDetails] = useState<RedirectDetail[]>([]);
	const [selected, setSelected] = useState<RedirectDetail | undefined>(undefined);
	const [redirectDetailCount, setRedirectDetailCount] = useState<number>(0);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [filters, setFilters] = useState<RedirectDetailOverviewFilterState | undefined>(
		undefined
	);
	const debouncedFilters: RedirectDetailOverviewFilterState | undefined = useDebounce(
		filters,
		250
	);
	const { mutateAsync: deleteRedirectDetail } = useDeleteRedirectDetail();

	const fetchRedirectDetails = useCallback(async () => {
		setIsLoading(true);

		try {
			const response = await RedirectDetailService.fetchRedirectDetails({
				query: debouncedFilters?.query,
				created_at: debouncedFilters?.created_at,
				updated_at: debouncedFilters?.updated_at,
				type: debouncedFilters?.type,
				sortOrder:
					debouncedFilters?.sort_order || (OrderDirection.desc as SearchOrderDirection),
				sortColumn: debouncedFilters?.sort_column || 'updated_at',
				limit: ITEMS_PER_PAGE,
				offset: (debouncedFilters?.page || 0) * ITEMS_PER_PAGE,
			});

			setRedirectDetails(response.redirectDetails);
			setRedirectDetailCount(response.count);

			setLoadingInfo({ state: 'loaded' });
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch redirect details from database', err, {
					filters,
				})
			);
			setLoadingInfo({
				state: 'error',
				message: tHtml('Het ophalen van de redirect details is mislukt'),
			});
		}
		setIsLoading(false);
	}, [debouncedFilters, tHtml, filters]);

	useEffect(() => {
		fetchRedirectDetails();
	}, [fetchRedirectDetails]);

	const handleDelete = async () => {
		try {
			setIsConfirmationModalOpen(false);
			if (!selected) {
				ToastService.danger(
					tHtml('Het verwijderen van de redirect is mislukt, probeer te herladen')
				);
				return;
			}

			await deleteRedirectDetail(selected.id);
			await fetchRedirectDetails();
			ToastService.success(tHtml('De redirect is verwijderd'));
		} catch (err) {
			console.error(
				new CustomError('Failed to delete redirect detail', err, {
					selected,
				})
			);
			ToastService.danger(tHtml('Het verwijderen van de redirect is mislukt'));
		}
	};

	const openModal = (redirect: RedirectDetail | undefined): void => {
		if (isNil(redirect)) {
			ToastService.danger(tHtml('De redirect kon niet worden verwijderd'));
			return;
		}
		setSelected(redirect);
		setIsConfirmationModalOpen(true);
	};

	const renderTableCell = (
		rowData: RedirectDetail,
		columnId: RedirectDetailOverviewTableCols
	) => {
		switch (columnId) {
			case 'oldPath':
				return rowData[columnId];

			case 'newPath': {
				const parsedPath = mapTechnicalPath(rowData.newPath);

				if (rowData.newPath.startsWith(PROXY_PATH_SHORTCUT)) {
					return (
						<a href={parsedPath} target="_blank" rel="noopener noreferrer">
							{rowData.newPath}
						</a>
					);
				}

				return (
					<Link to={rowData.newPath} replace={true} target="_blank">
						{rowData.newPath}
					</Link>
				);
			}

			case 'createdAt':
			case 'updatedAt':
				return formatDate(rowData[columnId]) || '-';

			case 'type':
				return REDIRECT_DETAIL_TYPE_OPTIONS().find(
					(option) => option.value === rowData.type
				)?.label;

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<ButtonToolbar>
						<Button
							icon={IconName.edit}
							onClick={() =>
								navigate(history, REDIRECT_DETAIL_PATH.REDIRECT_EDIT, {
									id: rowData.id,
								})
							}
							size="small"
							title={tText('Bewerk de redirect')}
							ariaLabel={tText('Bewerk de redirect')}
							type="secondary"
						/>
						<Button
							icon={IconName.delete}
							onClick={() => openModal(rowData)}
							size="small"
							title={tText('Verwijder de redirect')}
							ariaLabel={tText('Verwijder de redirect')}
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
			<ErrorView message={tHtml('Er zijn nog geen redirects aangemaakt')}>
				<p>{tHtml('Beschrijving hoe een redirect toe te voegen')}</p>
				<Spacer margin="top">
					<Button
						icon={IconName.plus}
						label={tText('Redirect aanmaken')}
						onClick={() => history.push(REDIRECT_DETAIL_PATH.REDIRECT_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		);
	};

	const renderRedirectsPageBody = () => {
		if (!redirectDetails) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={GET_REDIRECT_DETAIL_OVERVIEW_TABLE_COLS()}
					data={redirectDetails || []}
					dataCount={redirectDetailCount}
					renderCell={(rowData: RedirectDetail, columnId: string) =>
						renderTableCell(rowData, columnId as RedirectDetailOverviewTableCols)
					}
					searchTextPlaceholder={tText('Zoek op nieuwe of oude url')}
					renderNoResults={renderNoResults}
					onTableStateChanged={(state) => {
						// NOTE: prevents recursion loop but hits theoretical performance
						if (!isEqual(filters, state)) {
							setFilters(state as RedirectDetailOverviewFilterState);
						}
					}}
					itemsPerPage={ITEMS_PER_PAGE}
					noContentMatchingFiltersMessage={tText(
						'Er zijn geen redirects die voldoen aan de filters'
					)}
					isLoading={isLoading}
					showCheckboxes={false}
				/>
				<ConfirmModal
					confirmCallback={handleDelete}
					isOpen={isConfirmationModalOpen}
					onClose={() => setIsConfirmationModalOpen(false)}
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={tText('Redirects overview')} size="full-width">
			<AdminLayoutTopBarRight>
				<Button
					label={tText('Redirect toevoegen')}
					onClick={() => {
						redirectToClientPage(REDIRECT_DETAIL_PATH.REDIRECT_CREATE, history);
					}}
				/>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Helmet>
					<title>
						{GENERATE_SITE_TITLE(tText('redirect beheer overview pagina titel'))}
					</title>
					<meta
						name="description"
						content={tText('redirect beheer overview pagina beschrijving')}
					/>
				</Helmet>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={redirectDetails}
					render={renderRedirectsPageBody}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default RedirectDetailOverview;
