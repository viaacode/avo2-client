import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, Container, Modal, ModalBody, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import {
	CheckboxOption,
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import {
	buildLink,
	CustomError,
	formatDate,
	getFullName,
	getRole,
	navigate,
} from '../../../shared/helpers';
import { ApolloCacheManager, ToastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import {
	getBooleanFilters,
	getDateRangeFilters,
	getMultiOptionFilters,
	getQueryFilter,
} from '../../shared/helpers/filters';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';

import { CONTENT_PATH, ITEMS_PER_PAGE } from '../content.const';
import { DELETE_CONTENT } from '../content.gql';
import { ContentService } from '../content.service';
import { ContentOverviewTableCols, ContentTableState } from '../content.types';
import { useContentTypes } from '../hooks';
import './ContentOverview.scss';

interface ContentOverviewProps extends DefaultSecureRouteProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history, user }) => {
	// Hooks
	const [contentPages, setContentPages] = useState<Avo.Content.Content[] | null>(null);
	const [contentPageCount, setContentPageCount] = useState<number>(0);

	const [contentToDelete, setContentToDelete] = useState<Avo.Content.Content | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [isNotAdminModalOpen, setIsNotAdminModalOpen] = useState<boolean>(false);
	const [tableState, setTableState] = useState<Partial<ContentTableState>>({});
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [contentTypes] = useContentTypes();

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	const generateWhereObject = (filters: Partial<ContentTableState>) => {
		const andFilters: any[] = [];
		andFilters.push(
			...getQueryFilter(
				filters.query,
				// @ts-ignore
				(queryWordWildcard: string) => [
					{ title: { _ilike: queryWordWildcard } },
					{ profile: { usersByuserId: { first_name: { _ilike: queryWordWildcard } } } },
					{ profile: { usersByuserId: { last_name: { _ilike: queryWordWildcard } } } },
					{
						profile: {
							usersByuserId: { role: { label: { _ilike: queryWordWildcard } } },
						},
					},
					{
						content_content_labels: {
							content_label: {
								label: {
									_ilike: queryWordWildcard,
								},
							},
						},
					},
				]
			)
		);
		andFilters.push(...getBooleanFilters(filters, ['is_public']));
		andFilters.push(
			...getDateRangeFilters(filters, [
				'created_at',
				'updated_at',
				'publish_at',
				'depublish_at',
			])
		);
		andFilters.push(...getMultiOptionFilters(filters, ['content_type']));
		return { _and: andFilters };
	};

	const fetchContentPages = useCallback(async () => {
		try {
			const [
				contentPagesArray,
				contentPageCountTemp,
			] = await ContentService.fetchContentPages(
				tableState.page || 0,
				(tableState.sort_column || 'updated_at') as ContentOverviewTableCols,
				tableState.sort_order || 'desc',
				generateWhereObject(getFilters(tableState))
			);

			setContentPages(contentPagesArray);
			setContentPageCount(contentPageCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get content pages from graphql', err, {
					tableState,
					query: 'GET_CONTENT_PAGES',
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/content/views/content-overview___het-ophalen-van-de-content-paginas-is-mislukt'
				),
				icon: 'alert-triangle',
			});
		}
	}, [setContentPages, setContentPageCount, setLoadingInfo, tableState, t]);

	useEffect(() => {
		fetchContentPages();
	}, [fetchContentPages, tableState]);

	useEffect(() => {
		if (contentPages) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [contentPages]);

	// Computed
	const isAdminUser = get(user, 'profile.permissions', []).includes('EDIT_PROTECTED_PAGE_STATUS');

	const contentTypeOptions = contentTypes.map(
		(option): CheckboxOption => ({
			id: option.value,
			label: option.label,
			checked: get(tableState, 'content_type', [] as string[]).includes(option.value),
		})
	);

	const getColumnInfos: () => FilterableColumn[] = () => [
		{ id: 'title', label: i18n.t('admin/content/content___titel'), sortable: true },
		{
			id: 'content_type',
			label: i18n.t('admin/content/content___content-type'),
			sortable: true,
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				options: contentTypeOptions,
			},
		},
		{ id: 'author', label: i18n.t('admin/content/content___auteur'), sortable: true },
		{ id: 'role', label: i18n.t('admin/content/content___rol'), sortable: true },
		{
			id: 'created_at',
			label: i18n.t('admin/content/content___aangemaakt'),
			sortable: true,
			filterType: 'DateRangeDropdown',
		},
		{
			id: 'updated_at',
			label: i18n.t('admin/content/content___laatst-bewerkt'),
			sortable: true,
			filterType: 'DateRangeDropdown',
		},
		{
			id: 'publish_at',
			label: i18n.t('admin/content/content___publicatiedatum'),
			sortable: true,
			filterType: 'DateRangeDropdown',
		},
		{
			id: 'depublish_at',
			label: i18n.t('admin/content/content___depublicatiedatum'),
			sortable: true,
			filterType: 'DateRangeDropdown',
		},
		{ id: 'actions', label: '' },
	];

	// Methods
	const handleDelete = async () => {
		try {
			if (!contentToDelete) {
				return;
			}

			await triggerContentDelete({
				variables: { id: contentToDelete.id },
				update: ApolloCacheManager.clearContentCache,
			});
			ToastService.success(
				t(
					'admin/content/views/content-overview___het-content-item-is-succesvol-verwijderd'
				),
				false
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete content page', err, { contentToDelete })
			);
			ToastService.danger(
				t(
					'admin/content/views/content-overview___het-verwijderen-van-het-content-item-is-mislukt'
				),
				false
			);
		}
	};

	const openModal = (content: Avo.Content.Content): void => {
		if (content.is_protected) {
			// Only allow admins to delete protected content
			if (isAdminUser) {
				setContentToDelete(content);
				setIsConfirmModalOpen(true);
			} else {
				setIsNotAdminModalOpen(true);
			}
		} else {
			// TODO: check permissions for deleting content
			setContentToDelete(content);
			setIsConfirmModalOpen(true);
		}
	};

	// Render
	const renderTableCell = (rowData: any, columnId: string): ReactNode => {
		const { id, profile, title } = rowData;

		switch (columnId) {
			case 'title':
				return <Link to={buildLink(CONTENT_PATH.CONTENT_DETAIL, { id })}>{title}</Link>;
			case 'author':
				return getFullName(profile) || '-';
			case 'role':
				return getRole(profile) || '-';
			case 'publish_at':
			case 'depublish_at':
			case 'created_at':
			case 'updated_at':
				return !!rowData[columnId] ? formatDate(rowData[columnId] as string) : '-';
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="eye"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id })}
							size="small"
							title={t('admin/content/views/content-overview___bekijk-content')}
							type="secondary"
						/>
						<Button
							icon="edit"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
							size="small"
							title={t('admin/content/views/content-overview___pas-content-aan')}
							type="secondary"
						/>
						<Button
							icon="delete"
							onClick={() => openModal(rowData)}
							size="small"
							title={t('admin/content/views/content-overview___verwijder-content')}
							type="danger-hover"
						/>
					</ButtonToolbar>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderNoResults = () => {
		return (
			<ErrorView
				message={t(
					'admin/content/views/content-overview___er-is-nog-geen-content-aangemaakt'
				)}
			>
				<p>
					<Trans i18nKey="admin/content/views/content-overview___beschrijving-hoe-content-toe-te-voegen">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab
						debitis blanditiis vitae molestiae delectus earum asperiores mollitia,
						minima laborum expedita ratione quas impedit repudiandae nisi corrupti quis
						eaque!
					</Trans>
				</p>
				<Spacer margin="top">
					<Button
						icon="plus"
						label={t('admin/content/views/content-overview___content-toevoegen')}
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		);
	};

	const renderContentOverview = () => {
		if (!contentPages) {
			return null;
		}
		return (
			<>
				<FilterTable
					data={contentPages}
					itemsPerPage={ITEMS_PER_PAGE}
					columns={getColumnInfos()}
					dataCount={contentPageCount}
					searchTextPlaceholder={t(
						'admin/content/views/content-overview___zoeken-op-auteur-titel-rol'
					)}
					noContentMatchingFiltersMessage={t(
						'admin/content/views/content-overview___er-is-geen-content-gevonden-die-voldoen-aan-uw-filters'
					)}
					renderNoResults={renderNoResults}
					renderCell={renderTableCell}
					className="c-content-overview__table"
					onTableStateChanged={setTableState}
				/>
				<DeleteObjectModal
					deleteObjectCallback={handleDelete}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
					body={
						get(contentToDelete, 'is_protected', null)
							? t(
									'admin/content/views/content-overview___opgelet-dit-is-een-beschermde-pagina'
							  )
							: ''
					}
				/>
				<Modal
					isOpen={isNotAdminModalOpen}
					onClose={() => setIsNotAdminModalOpen(false)}
					size="small"
					title={t(
						'admin/content/views/content-overview___u-heeft-niet-de-juiste-rechten'
					)}
				>
					<ModalBody>
						<p>
							<Trans i18nKey="admin/content/views/content-overview___contacteer-een-van-de-admins-om-deze-pagina-te-kunnen-verwijderen">
								Contacteer een van de admins om deze pagina te kunnen verwijderen.
							</Trans>
						</p>
					</ModalBody>
				</Modal>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('admin/content/views/content-overview___content-overzicht')}>
			<AdminLayoutTopBarRight>
				<Button
					label={t('admin/content/views/content-overview___content-toevoegen')}
					onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
				/>
			</AdminLayoutTopBarRight>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={contentPages}
							render={renderContentOverview}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default ContentOverview;
