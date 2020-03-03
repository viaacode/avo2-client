import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
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
import { ApolloCacheManager, ToastService } from '../../../shared/services';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { ContentFilters } from '../components';
import {
	CONTENT_OVERVIEW_TABLE_COLS,
	CONTENT_PATH,
	CONTENT_RESULT_PATH,
	ITEMS_PER_PAGE,
} from '../content.const';
import { DELETE_CONTENT, GET_CONTENT_PAGES } from '../content.gql';
import { ContentFilterFormState, ContentOverviewTableCols } from '../content.types';
import { generateWhereObject } from '../helpers/filters';

import './ContentOverview.scss';

interface ContentOverviewProps extends DefaultSecureRouteProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history, user }) => {
	// Hooks
	const [contentList, setContentList] = useState<Avo.Content.Content[]>([]);
	const [contentToDelete, setContentToDelete] = useState<Avo.Content.Content | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [isNotAdminModalOpen, setIsNotAdminModalOpen] = useState<boolean>(false);
	const [page, setPage] = useState<number>(0);
	const [filters, setFilters] = useState<Partial<ContentFilterFormState>>({});
	// const [queryParamsAnalysed, setQueryParamsAnalysed] = useState<boolean>(false);

	// const hasFilters = useMemo(() => !isEqual(filterForm, INITIAL_FILTER_FORM()), [filterForm]);

	const [sortColumn, sortOrder, handleSortClick] = useTableSort<ContentOverviewTableCols>(
		'updated_at'
	);

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	// Computed
	// TODO: clean up admin check
	const isAdminUser = get(user, 'role.name', null) === 'admin';

	// Methods

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
				ToastService.success(
					t(
						'admin/content/views/content-overview___het-content-item-is-succesvol-verwijderd'
					),
					false
				);
			})
			.catch(err => {
				console.error(err);
				ToastService.danger(
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

	const hasFilters = () => {
		return (
			filters.contentType ||
			filters.createdDate ||
			filters.updatedDate ||
			filters.publishDate ||
			filters.depublishDate ||
			filters.query
		);
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
								: t(
										'admin/content/views/content-overview___er-is-nog-geen-content-beschikbaar'
								  )
						}
						onColumnClick={columId =>
							handleSortClick(columId as ContentOverviewTableCols)
						}
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
							? t(
									'admin/content/views/content-overview___opgelet-dit-is-een-beschermde-pagina'
							  )
							: ''
					}
				/>
				<Modal
					isOpen={isNotAdminModalOpen}
					onClose={() => setIsNotAdminModalOpen(false)}
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
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<ContentFilters onFiltersChange={setFilters} />
						<DataQueryComponent
							renderData={renderContentOverview}
							query={GET_CONTENT_PAGES}
							variables={{
								offset: page * ITEMS_PER_PAGE,
								order: { [sortColumn]: sortOrder },
								where: generateWhereObject(filters),
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
