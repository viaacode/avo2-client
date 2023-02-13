import { ContentPageLabelService } from '@meemoo/admin-core-ui';
import { Button, ButtonToolbar, IconName } from '@viaa/avo2-components';
import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import {
	CheckboxDropdownModalProps,
	CheckboxOption,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import SmartLink from '../../../shared/components/SmartLink/SmartLink';
import { buildLink, formatDate, navigate } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import useTranslation from '../../../shared/hooks/useTranslation';
import { ToastService } from '../../../shared/services/toast-service';
import { TableColumnDataType } from '../../../shared/types/table-column-data-type';
import { ADMIN_PATH } from '../../admin.const';
import { useContentTypes } from '../../content-page/hooks/useContentTypes';
import { ItemsTableState } from '../../items/items.types';
import { GET_CONTENT_TYPE_LABELS } from '../../shared/components/ContentPicker/ContentPicker.const';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import {
	getDateRangeFilters,
	getMultiOptionFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { CONTENT_PAGE_LABEL_PATH, ITEMS_PER_PAGE } from '../content-page-label.const';
import {
	ContentPageLabel,
	ContentPageLabelOverviewTableCols,
	ContentPageLabelTableState,
} from '../content-page-label.types';

import './ContentPageLabelOverview.scss';

type ContentPageLabelOverviewProps = DefaultSecureRouteProps;

const ContentPageLabelOverview: FunctionComponent<ContentPageLabelOverviewProps> = ({
	history,
}) => {
	// Hooks
	const [contentPageLabel, setContentPageLabels] = useState<ContentPageLabel[] | null>(null);
	const [contentPageLabelCount, setContentPageLabelCount] = useState<number>(0);
	const [contentPageLabelIdToDelete, setContentPageLabelIdToDelete] = useState<number | null>(
		null
	);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<ContentPageLabelTableState>>({});
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const [contentTypes] = useContentTypes() as [any[], boolean];

	const { tText, tHtml } = useTranslation();

	const fetchContentPageLabels = useCallback(async () => {
		setIsLoading(true);
		const generateWhereObject = (filters: Partial<ItemsTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(filters.query, (queryWildcard: string) => [
					{ label: { _ilike: queryWildcard } },
				])
			);
			andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
			andFilters.push(...getMultiOptionFilters(filters, ['content_type']));
			return { _and: andFilters };
		};

		try {
			const [contentPageLabelTemp, contentPageLabelCountTemp] =
				await ContentPageLabelService.fetchContentPageLabels(
					tableState.page || 0,
					(tableState.sort_column || 'updated_at') as ContentPageLabelOverviewTableCols,
					tableState.sort_order || 'desc',
					generateWhereObject(getFilters(tableState))
				);

			setContentPageLabels(contentPageLabelTemp);
			setContentPageLabelCount(contentPageLabelCountTemp);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: tText(
					'admin/content-page-labels/views/content-page-label-overview___het-ophalen-van-de-content-pagina-labels-is-mislukt'
				),
			});
		}
		setIsLoading(false);
	}, [setContentPageLabels, setLoadingInfo, tText, tableState]);

	useEffect(() => {
		fetchContentPageLabels();
	}, [fetchContentPageLabels]);

	useEffect(() => {
		if (contentPageLabel && !isNil(contentPageLabelCount)) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [contentPageLabel, contentPageLabelCount]);

	const contentTypeOptions = contentTypes.map(
		(option): CheckboxOption => ({
			id: option.value,
			label: option.label,
			checked: (get(tableState, 'content_type', [] as string[]) as string[]).includes(
				option.value
			),
		})
	);

	const getContentPageLabelOverviewTableCols: () => FilterableColumn<ContentPageLabelOverviewTableCols>[] =
		() => [
			{
				id: 'label',
				label: tText('admin/content-page-labels/views/content-page-label-overview___label'),
				sortable: true,
				visibleByDefault: true,
				dataType: TableColumnDataType.string,
			},
			{
				id: 'content_type',
				label: tText('admin/content-page-labels/views/content-page-label-overview___type'),
				sortable: true,
				visibleByDefault: true,
				filterType: 'CheckboxDropdownModal',
				filterProps: {
					options: contentTypeOptions,
				} as CheckboxDropdownModalProps,
				dataType: TableColumnDataType.string,
			},
			{
				id: 'link_to',
				label: tText('admin/content-page-labels/views/content-page-label-overview___link'),
				sortable: false,
				visibleByDefault: true,
			},
			{
				id: 'created_at',
				label: tText(
					'admin/content-page-labels/views/content-page-label-overview___gemaakt-op'
				),
				sortable: true,
				visibleByDefault: true,
				filterType: 'DateRangeDropdown',
				dataType: TableColumnDataType.dateTime,
			},
			{
				id: 'updated_at',
				label: tText(
					'admin/content-page-labels/views/content-page-label-overview___aangepast-op'
				),
				sortable: true,
				visibleByDefault: true,
				filterType: 'DateRangeDropdown',
				dataType: TableColumnDataType.dateTime,
			},
			{
				id: 'actions',
				tooltip: tText(
					'admin/content-page-labels/views/content-page-label-overview___acties'
				),
				visibleByDefault: true,
			},
		];

	// Methods
	const handleDelete = async () => {
		if (isNil(contentPageLabelIdToDelete)) {
			ToastService.danger(
				tHtml(
					'admin/content-page-labels/views/content-page-label-overview___het-verwijderen-van-het-label-is-mislukt-omdat-geen-label-geselecteerd-is'
				)
			);
			return;
		}
		setIsConfirmModalOpen(false);
		await ContentPageLabelService.deleteContentPageLabel(contentPageLabelIdToDelete);
		await fetchContentPageLabels();
		ToastService.success(
			tHtml(
				'admin/content-page-labels/views/content-page-label-overview___de-content-pagina-label-is-verwijdert'
			)
		);
	};

	const openModal = (contentPageLabel: ContentPageLabel): void => {
		setIsConfirmModalOpen(true);
		setContentPageLabelIdToDelete(contentPageLabel.id);
	};

	// Render
	const renderTableCell = (
		rowData: ContentPageLabel,
		columnId: ContentPageLabelOverviewTableCols
	) => {
		switch (columnId) {
			case 'label':
				return (
					<Link to={buildLink(ADMIN_PATH.CONTENT_PAGE_LABEL_DETAIL, { id: rowData.id })}>
						{truncateTableValue(rowData[columnId])}
					</Link>
				);

			case 'created_at':
			case 'updated_at':
				return rowData[columnId] ? formatDate(rowData[columnId] as string) : '-';

			case 'link_to': {
				const linkTo = rowData.link_to;
				if (!linkTo) {
					return '-';
				}
				const labels = GET_CONTENT_TYPE_LABELS();
				return (
					<SmartLink action={linkTo} removeStyles={false}>{`${
						labels[linkTo.type]
					} - ${decodeURIComponent(
						String(linkTo.value)?.split('hetarchief.be')?.pop() || ''
					)}`}</SmartLink>
				);
			}

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon={IconName.info}
							onClick={() =>
								navigate(
									history,
									CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_DETAIL,
									{
										id: rowData.id,
									}
								)
							}
							size="small"
							ariaLabel={tText(
								'admin/content-page-labels/views/content-page-label-overview___bekijk-de-details-van-deze-content-pagina-label'
							)}
							title={tText(
								'admin/content-page-labels/views/content-page-label-overview___bekijk-de-details-van-deze-content-pagina-label'
							)}
							type="secondary"
						/>
						<Button
							icon={IconName.edit}
							onClick={() =>
								navigate(history, CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT, {
									id: rowData.id,
								})
							}
							size="small"
							ariaLabel={tText(
								'admin/content-page-labels/views/content-page-label-overview___bewerk-deze-content-pagina-label'
							)}
							title={tText(
								'admin/content-page-labels/views/content-page-label-overview___bewerk-deze-content-pagina-label'
							)}
							type="secondary"
						/>
						<Button
							icon={IconName.delete}
							onClick={() => openModal(rowData)}
							size="small"
							ariaLabel={tText(
								'admin/content-page-labels/views/content-page-label-overview___verwijder-deze-content-pagina-label'
							)}
							title={tText(
								'admin/content-page-labels/views/content-page-label-overview___verwijder-deze-content-pagina-label'
							)}
							type="danger-hover"
						/>
					</ButtonToolbar>
				);

			default:
				return truncateTableValue(rowData[columnId]);
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={tHtml(
					'admin/content-page-labels/views/content-page-label-overview___er-zijn-nog-geen-content-pagina-labels-aangemaakt'
				)}
			>
				<p>
					{tHtml(
						'admin/content-page-labels/views/content-page-label-overview___er-zijn-nog-geen-content-pagina-labels-aangemaakt'
					)}
				</p>
			</ErrorView>
		);
	};

	const renderContentPageLabelTable = () => {
		return (
			<>
				<FilterTable
					columns={getContentPageLabelOverviewTableCols()}
					data={contentPageLabel || []}
					dataCount={contentPageLabelCount}
					renderCell={(rowData: ContentPageLabel, columnId: string) =>
						renderTableCell(rowData, columnId as ContentPageLabelOverviewTableCols)
					}
					searchTextPlaceholder={tText(
						'admin/content-page-labels/views/content-page-label-overview___zoek-op-label'
					)}
					renderNoResults={renderNoResults}
					noContentMatchingFiltersMessage={tText(
						'admin/content-page-labels/views/content-page-label-overview___er-zijn-geen-content-pagina-labels-gevonden-die-voldoen-aan-je-zoekterm'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
					isLoading={isLoading}
				/>
				<DeleteObjectModal
					confirmCallback={handleDelete}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
					title={tText(
						'admin/content-page-labels/views/content-page-label-overview___ben-je-zeker-dat-je-dit-label-wil-verwijderen'
					)}
					body={tText(
						'admin/content-page-labels/views/content-page-label-overview___deze-actie-kan-niet-ongedaan-gemaakt-worden'
					)}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={tText(
				'admin/content-page-labels/views/content-page-label-overview___content-pagina-labels-overzicht'
			)}
			size="full-width"
		>
			<AdminLayoutTopBarRight>
				<Button
					label={tText(
						'admin/content-page-labels/views/content-page-label-overview___content-pagina-label-toevoegen'
					)}
					onClick={() => history.push(CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE)}
				/>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/content-page-labels/views/content-page-label-overview___content-page-label-beheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/content-page-labels/views/content-page-label-overview___content-page-label-beheer-overzicht-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<LoadingErrorLoadedComponent
					loadingInfo={loadingInfo}
					dataObject={contentPageLabel}
					render={renderContentPageLabelTable}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentPageLabelOverview;
