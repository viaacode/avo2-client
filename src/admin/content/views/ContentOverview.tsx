import { useMutation } from '@apollo/react-hooks';
import { get } from 'lodash-es';
import React, { FunctionComponent, ReactNode, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, Container, Modal, ModalBody, Spacer } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent, DeleteObjectModal } from '../../../shared/components';
import { CheckboxOption } from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import { buildLink, formatDate, getFullName, getRole, navigate } from '../../../shared/helpers';
import { ApolloCacheManager, ToastService } from '../../../shared/services';
import {
	FilterableColumn,
	FilterTable,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import { CheckboxListParam } from '../../shared/helpers/query-string-converters';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import i18n from '../../../shared/translations/i18n';
import { CONTENT_PATH, CONTENT_RESULT_PATH, ITEMS_PER_PAGE } from '../content.const';
import { DELETE_CONTENT, GET_CONTENT_PAGES } from '../content.gql';
import { ContentTableState } from '../content.types';
import { generateWhereObject } from '../helpers/filters';
import { useContentTypes } from '../hooks';
import './ContentOverview.scss';

interface ContentOverviewProps extends DefaultSecureRouteProps {}

const ContentOverview: FunctionComponent<ContentOverviewProps> = ({ history, user }) => {
	// Hooks
	const [contentList, setContentList] = useState<Avo.Content.Content[]>([]);
	const [contentToDelete, setContentToDelete] = useState<Avo.Content.Content | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [isNotAdminModalOpen, setIsNotAdminModalOpen] = useState<boolean>(false);
	const [tableState, setTableState] = useState<Partial<ContentTableState>>({});

	const [contentTypes] = useContentTypes();

	const [triggerContentDelete] = useMutation(DELETE_CONTENT);
	const [t] = useTranslation();

	const handleTableStateUpdate = (newTableState: ContentTableState) => {
		setTableState(newTableState);
	};

	// Computed
	// TODO: clean up admin check
	const isAdminUser = get(user, 'role.name', null) === 'admin';

	const contentTypeOptions = contentTypes.map(
		(option): CheckboxOption => ({
			id: option.value,
			label: option.label,
			checked: (tableState.content_type || []).includes(option.value),
		})
	);

	const columnInfos: FilterableColumn[] = [
		{ id: 'title', label: i18n.t('admin/content/content___titel') },
		{
			id: 'content_type',
			label: i18n.t('admin/content/content___content-type'),
			queryParamConverter: CheckboxListParam,
			filterType: 'CheckboxDropdownModal',
			props: {
				id: 'content-filter-type',
				label: t('admin/content/components/content-filters/content-filters___type'),
				options: contentTypeOptions,
			},
		},
		{ id: 'author', label: i18n.t('admin/content/content___auteur') },
		{ id: 'role', label: i18n.t('admin/content/content___rol') },
		{
			id: 'publish_at',
			label: i18n.t('admin/content/content___publicatiedatum'),
			sortable: true,
		},
		{
			id: 'depublish_at',
			label: i18n.t('admin/content/content___depublicatiedatum'),
			sortable: true,
		},
		{ id: 'created_at', label: i18n.t('admin/content/content___aangemaakt'), sortable: true },
		{
			id: 'updated_at',
			label: i18n.t('admin/content/content___laatst-bewerkt'),
			sortable: true,
		},
		{ id: 'actions', label: '' },
	];

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

		return !contentData.length && !!getFilters(tableState) ? (
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
				<FilterTable
					data={contentData}
					itemsPerPage={ITEMS_PER_PAGE}
					columns={columnInfos}
					dataCount={countData}
					defaultSortColumn={'updated_at' as keyof Avo.Content.Content}
					searchTextPlaceholder={t('Zoeken op auteur, titel')}
					noContentMatchingFiltersMessage={t(
						'admin/content/views/content-overview___er-is-geen-content-gevonden-die-voldoen-aan-uw-filters'
					)}
					noContentMessage={t(
						'admin/content/views/content-overview___er-is-nog-geen-content-beschikbaar'
					)}
					renderTableCell={renderTableCell}
					className="c-content-overview__table"
					onTableStateChanged={handleTableStateUpdate as any}
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
						<DataQueryComponent
							renderData={renderContentOverview}
							query={GET_CONTENT_PAGES}
							variables={{
								offset: (tableState.page || 0) * ITEMS_PER_PAGE,
								order: {
									[tableState.sort_column || 'updated_at']:
										tableState.sort_order || 'desc',
								},
								where: generateWhereObject(getFilters(tableState)),
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
