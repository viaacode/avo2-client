import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import MetaTags from 'react-meta-tags';

import { Button, ButtonToolbar, Container } from '@viaa/avo2-components';

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
import { formatDate, navigate, navigateToContentType } from '../../../shared/helpers';
import { truncateTableValue } from '../../../shared/helpers/truncate';
import { ToastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';
import { useContentTypes } from '../../content/hooks';
import { ItemsTableState } from '../../items/items.types';
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
import { ContentPageLabelService } from '../content-page-label.service';
import {
	ContentPageLabel,
	ContentPageLabelOverviewTableCols,
	ContentPageLabelTableState,
} from '../content-page-label.types';

import './ContentPageLabelOverview.scss';
import { GET_CONTENT_TYPE_LABELS } from '../../shared/components/ContentPicker/ContentPicker.const';

interface ContentPageLabelOverviewProps extends DefaultSecureRouteProps {}

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

	const [contentTypes] = useContentTypes();

	const [t] = useTranslation();

	const fetchContentPageLabels = useCallback(async () => {
		const generateWhereObject = (filters: Partial<ItemsTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(filters.query, (queryWordWildcard: string) => [
					{ label: { _ilike: queryWordWildcard } },
				])
			);
			andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
			andFilters.push(...getMultiOptionFilters(filters, ['content_type']));
			return { _and: andFilters };
		};

		try {
			const [
				contentPageLabelTemp,
				contentPageLabelCountTemp,
			] = await ContentPageLabelService.fetchContentPageLabels(
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
				message: t(
					'admin/content-page-labels/views/content-page-label-overview___het-ophalen-van-de-content-pagina-labels-is-mislukt'
				),
			});
		}
	}, [setContentPageLabels, setLoadingInfo, t, tableState]);

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

	const getContentPageLabelOverviewTableCols: () => FilterableColumn[] = () => [
		{
			id: 'label',
			label: i18n.t('admin/content-page-labels/views/content-page-label-overview___label'),
			sortable: true,
			visibleByDefault: true,
		},
		{
			id: 'content_type',
			label: i18n.t('admin/content-page-labels/views/content-page-label-overview___type'),
			sortable: true,
			visibleByDefault: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: contentTypeOptions,
			} as CheckboxDropdownModalProps,
		},
		{
			id: 'link_to',
			label: i18n.t('Link'),
			sortable: false,
			visibleByDefault: true,
		},
		{
			id: 'created_at',
			label: i18n.t(
				'admin/content-page-labels/views/content-page-label-overview___gemaakt-op'
			),
			sortable: true,
			visibleByDefault: true,
			filterType: 'DateRangeDropdown',
		},
		{
			id: 'updated_at',
			label: i18n.t(
				'admin/content-page-labels/views/content-page-label-overview___aangepast-op'
			),
			sortable: true,
			visibleByDefault: true,
			filterType: 'DateRangeDropdown',
		},
		{
			id: 'actions',
			tooltip: i18n.t('admin/content-page-labels/views/content-page-label-overview___acties'),
			visibleByDefault: true,
		},
	];

	// Methods
	const handleDelete = async () => {
		await ContentPageLabelService.deleteContentPageLabel(contentPageLabelIdToDelete);
		await fetchContentPageLabels();
		ToastService.success(
			t(
				'admin/content-page-labels/views/content-page-label-overview___de-content-pagina-label-is-verwijdert'
			),
			false
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
			case 'created_at':
			case 'updated_at':
				return !!rowData[columnId] ? formatDate(rowData[columnId] as string) : '-';

			case 'link_to':
				const linkTo = rowData.link_to;
				if (!linkTo) {
					return '-';
				}
				const labels = GET_CONTENT_TYPE_LABELS();
				return (
					<Button
						type="inline-link"
						onClick={() => navigateToContentType(linkTo, history)}
					>{`${labels[linkTo.type]} - ${linkTo.label}`}</Button>
				);

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="info"
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
							ariaLabel={t(
								'admin/content-page-labels/views/content-page-label-overview___bekijk-de-details-van-deze-content-pagina-label'
							)}
							title={t(
								'admin/content-page-labels/views/content-page-label-overview___bekijk-de-details-van-deze-content-pagina-label'
							)}
							type="secondary"
						/>
						<Button
							icon="edit"
							onClick={() =>
								navigate(history, CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_EDIT, {
									id: rowData.id,
								})
							}
							size="small"
							ariaLabel={t(
								'admin/content-page-labels/views/content-page-label-overview___bewerk-deze-content-pagina-label'
							)}
							title={t(
								'admin/content-page-labels/views/content-page-label-overview___bewerk-deze-content-pagina-label'
							)}
							type="secondary"
						/>
						<Button
							icon="delete"
							onClick={() => openModal(rowData)}
							size="small"
							ariaLabel={t(
								'admin/content-page-labels/views/content-page-label-overview___verwijder-deze-content-pagina-label'
							)}
							title={t(
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
				message={t(
					'admin/content-page-labels/views/content-page-label-overview___er-zijn-nog-geen-content-pagina-labels-aangemaakt'
				)}
			>
				<p>
					<Trans i18nKey="Beschrijving wanneer er nog geen content pagina labels zijn aangemaakt">
						Beschrijving wanneer er nog geen permissie groepen zijn aangemaakt
					</Trans>
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
					searchTextPlaceholder={t(
						'admin/content-page-labels/views/content-page-label-overview___zoek-op-label'
					)}
					renderNoResults={renderNoResults}
					noContentMatchingFiltersMessage={t(
						'admin/content-page-labels/views/content-page-label-overview___er-zijn-geen-content-pagina-labels-gevonden-die-voldoen-aan-je-zoekterm'
					)}
					itemsPerPage={ITEMS_PER_PAGE}
					onTableStateChanged={setTableState}
				/>
				<DeleteObjectModal
					deleteObjectCallback={() => handleDelete()}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={t(
				'admin/content-page-labels/views/content-page-label-overview___content-pagina-labels-overzicht'
			)}
		>
			<AdminLayoutTopBarRight>
				<Button
					label={t(
						'admin/content-page-labels/views/content-page-label-overview___content-pagina-label-toevoegen'
					)}
					onClick={() => history.push(CONTENT_PAGE_LABEL_PATH.CONTENT_PAGE_LABEL_CREATE)}
				/>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							t(
								'admin/content-page-labels/views/content-page-label-overview___content-page-label-beheer-overzicht-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={t(
							'admin/content-page-labels/views/content-page-label-overview___content-page-label-beheer-overzicht-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={contentPageLabel}
							render={renderContentPageLabelTable}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentPageLabelOverview;
