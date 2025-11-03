import { FilterTable } from '@meemoo/admin-core-ui/admin';
import { Button, ButtonToolbar, IconName, Spacer } from '@viaa/avo2-components';
import { PermissionName } from '@viaa/avo2-types';
import { isEqual, isNil } from 'lodash-es';
import React, { type FC, useState } from 'react';
import { Helmet } from 'react-helmet';
import { useNavigate } from 'react-router';
import { Link } from 'react-router-dom';

import { PermissionGuard } from '../../../authentication/components/PermissionGuard';
import { redirectToClientPage } from '../../../authentication/helpers/redirects/redirect-to-client-page';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views/ErrorView';
import { ConfirmModal } from '../../../shared/components/ConfirmModal/ConfirmModal';
import { FullPageSpinner } from '../../../shared/components/FullPageSpinner/FullPageSpinner';
import { CustomError } from '../../../shared/helpers/custom-error';
import { formatDate } from '../../../shared/helpers/formatters';
import { navigate } from '../../../shared/helpers/link';
import { ACTIONS_TABLE_COLUMN_ID } from '../../../shared/helpers/table-column-list-to-csv-column-list';
import { tHtml } from '../../../shared/helpers/translate-html';
import { tText } from '../../../shared/helpers/translate-text';
import { useDebounce } from '../../../shared/hooks/useDebounce';
import { ToastService } from '../../../shared/services/toast-service';
import { AdminLayout } from '../../shared/layouts/AdminLayout/AdminLayout';
import {
	AdminLayoutBody,
	AdminLayoutTopBarRight,
} from '../../shared/layouts/AdminLayout/AdminLayout.slots';
import {
	PROXY_PATH_SHORTCUT,
	replaceProxyUrlTemplateWithUrl,
} from '../helpers/replace-proxy-url-template-with-url';
import { useDeleteUrlRedirect } from '../hooks/useDeleteUrlRedirect';
import { useGetUrlRedirects } from '../hooks/useGetUrlRedirects';
import {
	GET_URL_REDIRECT_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
	URL_REDIRECT_PATH,
	URL_REDIRECT_PATTERN_OPTIONS,
} from '../url-redirects.const';
import {
	type UrlRedirect,
	type UrlRedirectOverviewFilterState,
	type UrlRedirectOverviewTableCols,
} from '../url-redirects.types';

const UrlRedirectOverview: FC = () => {
	const navigateFunc = useNavigate();
	// State
	const [selected, setSelected] = useState<UrlRedirect | undefined>(undefined);
	const [isConfirmationModalOpen, setIsConfirmationModalOpen] = useState(false);

	const [filters, setFilters] = useState<UrlRedirectOverviewFilterState | undefined>(undefined);
	const debouncedFilters: UrlRedirectOverviewFilterState | undefined = useDebounce(filters, 250);

	const {
		data: urlRedirectsAndCount,
		isLoading,
		error,
		refetch: refetchUrlRedirects,
	} = useGetUrlRedirects(debouncedFilters);
	const { mutateAsync: deleteUrlRedirect } = useDeleteUrlRedirect();

	const handleDelete = async () => {
		try {
			setIsConfirmationModalOpen(false);
			if (!selected) {
				ToastService.danger(
					tHtml(
						'admin/url-redirects/views/url-redirect-overview___het-verwijderen-van-de-url-redirect-is-mislukt-probeer-te-herladen'
					)
				);
				return;
			}

			await deleteUrlRedirect(selected.id);
			await refetchUrlRedirects();
			ToastService.success(
				tHtml(
					'admin/url-redirects/views/url-redirect-overview___de-url-redirect-is-verwijderd'
				)
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete url redirect', err, {
					selected,
				})
			);
			ToastService.danger(
				tHtml(
					'admin/url-redirects/views/url-redirect-overview___het-verwijderen-van-de-url-redirect-is-mislukt'
				)
			);
		}
	};

	const openModal = (redirect: UrlRedirect | undefined): void => {
		if (isNil(redirect)) {
			ToastService.danger(
				tHtml(
					'admin/url-redirects/views/url-redirect-overview___de-url-redirect-kon-niet-worden-verwijderd'
				)
			);
			return;
		}
		setSelected(redirect);
		setIsConfirmationModalOpen(true);
	};

	const renderTableCell = (rowData: UrlRedirect, columnId: UrlRedirectOverviewTableCols) => {
		switch (columnId) {
			case 'oldPathPattern':
				return URL_REDIRECT_PATTERN_OPTIONS().find(
					(option) => option.value === rowData.oldPathPattern
				)?.label;

			case 'oldPath':
				return rowData[columnId];

			case 'newPath': {
				const parsedPath = replaceProxyUrlTemplateWithUrl(rowData.newPath);

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

			case ACTIONS_TABLE_COLUMN_ID:
				return (
					<ButtonToolbar>
						<Button
							icon={IconName.edit}
							onClick={() =>
								navigate(navigateFunc, URL_REDIRECT_PATH.URL_REDIRECT_EDIT, {
									id: rowData.id,
								})
							}
							size="small"
							title={tText(
								'admin/url-redirects/views/url-redirect-overview___bewerk-de-url-redirect'
							)}
							ariaLabel={tText(
								'admin/url-redirects/views/url-redirect-overview___bewerk-de-url-redirect'
							)}
							type="secondary"
						/>
						<Button
							icon={IconName.delete}
							onClick={() => openModal(rowData)}
							size="small"
							title={tText(
								'admin/url-redirects/views/url-redirect-overview___verwijder-de-url-redirect'
							)}
							ariaLabel={tText(
								'admin/url-redirects/views/url-redirect-overview___verwijder-de-url-redirect'
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
					'admin/url-redirects/views/url-redirect-overview___er-zijn-nog-geen-url-redirects-aangemaakt'
				)}
			>
				<p>
					{tHtml(
						'admin/url-redirects/views/url-redirect-overview___beschrijving-hoe-een-url-redirect-toe-te-voegen'
					)}
				</p>
				<Spacer margin="top">
					<Button
						icon={IconName.plus}
						label={tText(
							'admin/url-redirects/views/url-redirect-overview___url-redirect-aanmaken'
						)}
						onClick={() => navigateFunc(URL_REDIRECT_PATH.URL_REDIRECT_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		);
	};

	const renderRedirectsPageBody = () => {
		if (isLoading) {
			return <FullPageSpinner />;
		}

		if (error || !urlRedirectsAndCount) {
			return (
				<ErrorView
					message={tHtml(
						'admin/url-redirects/views/url-redirect-overview___het-ophalen-van-de-url-redirects-is-mislukt'
					)}
					icon={IconName.alertTriangle}
				/>
			);
		}

		return (
			<>
				<FilterTable
					columns={GET_URL_REDIRECT_OVERVIEW_TABLE_COLS()}
					data={urlRedirectsAndCount.urlRedirects || []}
					dataCount={urlRedirectsAndCount.count || 0}
					renderCell={(rowData: UrlRedirect, columnId: string) =>
						renderTableCell(rowData, columnId as UrlRedirectOverviewTableCols)
					}
					searchTextPlaceholder={tText(
						'admin/url-redirects/views/url-redirect-overview___zoek-op-nieuwe-of-oude-url'
					)}
					renderNoResults={renderNoResults}
					onTableStateChanged={(state) => {
						// NOTE: prevents recursion loop but hits theoretical performance
						if (!isEqual(filters, state)) {
							setFilters(state as UrlRedirectOverviewFilterState);
						}
					}}
					itemsPerPage={ITEMS_PER_PAGE}
					noContentMatchingFiltersMessage={tText(
						'admin/url-redirects/views/url-redirect-overview___er-zijn-geen-url-redirects-die-voldoen-aan-de-filters'
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
		<PermissionGuard permissions={[PermissionName.EDIT_REDIRECTS]}>
			<AdminLayout
				pageTitle={tText(
					'admin/url-redirects/views/url-redirect-overview___url-redirects-overview'
				)}
				size="full-width"
			>
				<AdminLayoutTopBarRight>
					<Button
						label={tText(
							'admin/url-redirects/views/url-redirect-overview___url-redirect-toevoegen'
						)}
						onClick={() => {
							redirectToClientPage(
								URL_REDIRECT_PATH.URL_REDIRECT_CREATE,
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
									'admin/url-redirects/views/url-redirect-overview___url-redirect-beheer-overview-pagina-titel'
								)
							)}
						</title>
						<meta
							name="description"
							content={tText(
								'admin/url-redirects/views/url-redirect-overview___url-redirect-beheer-overview-pagina-beschrijving'
							)}
						/>
					</Helmet>
					{renderRedirectsPageBody()}
				</AdminLayoutBody>
			</AdminLayout>
		</PermissionGuard>
	);
};

export default UrlRedirectOverview;
