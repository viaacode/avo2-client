import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, get, isEmpty, isEqual } from 'lodash-es';
import queryString from 'query-string';
import React, { FunctionComponent, useEffect, useMemo, useReducer, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import {
	Button,
	ButtonToolbar,
	Container,
	Modal,
	ModalBody,
	Pagination,
	Spacer,
	Table,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent, DeleteObjectModal } from '../../../shared/components';
import { buildLink, formatDate, getFullName, getRole, navigate } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import toastService from '../../../shared/services/toast-service';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { ContentFilters } from '../components';
import {
	CONTENT_OVERVIEW_TABLE_COLS,
	CONTENT_PATH,
	CONTENT_RESULT_PATH,
	INITIAL_CONTENT_OVERVIEW_STATE,
	INITIAL_FILTER_FORM,
	ITEMS_PER_PAGE,
} from '../content.const';
import { DELETE_CONTENT, GET_CONTENT } from '../content.gql';
import { ContentFilterFormState, ContentOverviewTableCols } from '../content.types';
import { cleanFiltersObject, generateWhereObject } from '../helpers/filters';
import {
	ContentOverviewActionType,
	ContentOverviewReducer,
	contentOverviewReducer,
} from '../helpers/reducers';
import { useContentTypes } from '../hooks';

import './ContentOverview.scss';

interface ContentOverviewProps extends DefaultSecureRouteProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history, location, user }) => {
	// Hooks
	const [{ filterForm }, dispatch] = useReducer<ContentOverviewReducer>(
		contentOverviewReducer,
		INITIAL_CONTENT_OVERVIEW_STATE()
	);

	const [contentList, setContentList] = useState<Avo.Content.Content[]>([]);
	const [contentToDelete, setContentToDelete] = useState<Avo.Content.Content | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [isNotAdminModalOpen, setIsNotAdminModalOpen] = useState<boolean>(false);
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [page, setPage] = useState<number>(0);
	const [queryParamsAnalysed, setQueryParamsAnalysed] = useState<boolean>(false);

	const hasFilters = useMemo(() => !isEqual(filterForm, INITIAL_FILTER_FORM()), [filterForm]);

	const [contentTypes] = useContentTypes();
	const [sortColumn, sortOrder, handleSortClick] = useTableSort<ContentOverviewTableCols>(
		'updated_at'
	);

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	useEffect(() => {
		// Get query params and transform to workable filter object
		if (!queryParamsAnalysed) {
			const queryParams = queryString.parse(location.search);

			if (queryParams.filters) {
				try {
					const filters = JSON.parse(queryParams.filters as string);
					const cleanFilters = cleanFiltersObject(filters);
					const newFormState = {
						...INITIAL_FILTER_FORM(),
						...cleanFilters,
					};

					// Set query
					setSearchTerm(newFormState.query);
					// Set filter form
					dispatch({
						type: ContentOverviewActionType.SET_FILTER_FORM,
						payload: newFormState,
					});
				} catch (err) {
					console.error(err);
					toastService.danger(
						t('admin/content/views/content-overview___ongeldige-zoek-query'),
						false
					);
				}
			}

			setQueryParamsAnalysed(true);
		}
	}, [location.search, queryParamsAnalysed, t]);

	useEffect(() => {
		// Reflect filter changes in url query
		const cleanFilters = cleanFiltersObject(cloneDeep(filterForm));
		const oldQuery = queryString.parse(location.search).filters;
		const newQuery = JSON.stringify(cleanFilters);

		if (!isEqual(oldQuery, newQuery)) {
			const filterString = !isEmpty(cleanFilters) ? `filters=${newQuery}` : '';
			navigate(history, CONTENT_PATH.CONTENT, {}, filterString);
		}
	}, [filterForm, history, location.search]);

	// Computed
	// TODO: clean up admin check
	const isAdminUser = get(user, 'role.name', null) === 'admin';

	// Methods
	const clearFilters = () => {
		setSearchTerm('');
		dispatch({
			type: ContentOverviewActionType.SET_FILTER_FORM,
			payload: INITIAL_FILTER_FORM(),
		});
	};

	const handleFilterChange = <K extends keyof ContentFilterFormState>(
		key: K,
		value: ContentFilterFormState[K]
	) => {
		dispatch({
			type: ContentOverviewActionType.UPDATE_FILTER_FORM,
			payload: { [key]: value },
		});
	};

	const handleDelete = (refetchContentItems: () => void) => {
		if (!contentToDelete) {
			return;
		}

		triggerContentDelete({
			variables: { id: contentToDelete.id },
			update: ApolloCacheManager.clearContentCache,
		})
			.then(() => {
				refetchContentItems();
				toastService.success(
					t('admin/content/views/content-overview___het-content-item-is-succesvol-verwijderd'),
					false
				);
			})
			.catch(err => {
				console.error(err);
				toastService.danger(
					t(
						'admin/content/views/content-overview___het-verwijderen-van-het-content-item-is-mislukt'
					),
					false
				);
			});
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
	const renderTableCell = (rowData: Avo.Content.Content, columnId: ContentOverviewTableCols) => {
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
							icon="info"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_DETAIL, { id })}
							size="small"
							title={t('admin/content/views/content-overview___bekijk-content')}
							type="tertiary"
						/>
						<Button
							icon="edit"
							onClick={() => navigate(history, CONTENT_PATH.CONTENT_EDIT, { id })}
							size="small"
							title={t('admin/content/views/content-overview___pas-content-aan')}
							type="tertiary"
						/>
						<Button
							icon="delete"
							onClick={() => openModal(rowData)}
							size="small"
							title={t('admin/content/views/content-overview___verwijder-content')}
							type="tertiary"
						/>
					</ButtonToolbar>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderContentOverview = (
		data: {
			app_content: Avo.Content.Content[];
			app_content_aggregate: { aggregate: { count: number } };
		},
		refetchContentItems: () => void
	) => {
		const contentData: Avo.Content.Content[] = get(data, CONTENT_RESULT_PATH.GET, []);
		const countData: number = get(data, `${CONTENT_RESULT_PATH.COUNT}.aggregate.count`, 0);

		if (contentData.length) {
			setContentList(contentData);
		}

		return !contentData.length && !hasFilters ? (
			<ErrorView
				message={t('admin/content/views/content-overview___er-is-nog-geen-content-aangemaakt')}
			>
				<p>
					<Trans i18nKey="admin/content/views/content-overview___beschrijving-hoe-content-toe-te-voegen">
						Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab debitis
						blanditiis vitae molestiae delectus earum asperiores mollitia, minima laborum expedita
						ratione quas impedit repudiandae nisi corrupti quis eaque!
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
		) : (
			<>
				<div className="c-table-responsive u-spacer-bottom">
					<Table
						className="c-content-overview__table"
						columns={CONTENT_OVERVIEW_TABLE_COLS}
						data={contentData}
						emptyStateMessage={
							hasFilters
								? t(
										'admin/content/views/content-overview___er-is-geen-content-gevonden-die-voldoen-aan-uw-filters'
								  )
								: t('admin/content/views/content-overview___er-is-nog-geen-content-beschikbaar')
						}
						onColumnClick={columId => handleSortClick(columId as ContentOverviewTableCols)}
						renderCell={(rowData: Avo.Content.Content, columnId: string) =>
							renderTableCell(rowData, columnId as ContentOverviewTableCols)
						}
						rowKey="id"
						variant="bordered"
						sortColumn={sortColumn}
						sortOrder={sortOrder}
					/>
				</div>
				<Pagination
					pageCount={Math.ceil(countData / ITEMS_PER_PAGE)}
					onPageChange={setPage}
					currentPage={page}
				/>
				<DeleteObjectModal
					deleteObjectCallback={() => handleDelete(refetchContentItems)}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
					body={
						get(contentToDelete, 'is_protected', null)
							? t('admin/content/views/content-overview___opgelet-dit-is-een-beschermde-pagina')
							: ''
					}
				/>
				<Modal
					isOpen={isNotAdminModalOpen}
					onClose={() => setIsNotAdminModalOpen(false)}
					title={t('admin/content/views/content-overview___u-heeft-niet-de-juiste-rechten')}
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
		<AdminLayout pageTitle="Content overzicht">
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<ContentFilters
							contentTypes={contentTypes}
							formState={filterForm}
							hasFilters={hasFilters}
							onClearFilters={clearFilters}
							onFilterChange={handleFilterChange}
							onQueryChange={setSearchTerm}
							query={searchTerm}
						/>
						<DataQueryComponent
							renderData={renderContentOverview}
							query={GET_CONTENT}
							variables={{
								offset: page * ITEMS_PER_PAGE,
								order: { [sortColumn]: sortOrder },
								where: generateWhereObject(filterForm),
							}}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				{!!contentList.length ? (
					<Button
						label={t('admin/content/views/content-overview___content-toevoegen')}
						onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
					/>
				) : null}
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default ContentOverview;
