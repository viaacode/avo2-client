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
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { CheckboxOption } from '../../../shared/components/CheckboxDropdownModal/CheckboxDropdownModal';
import {
	buildLink,
	CustomError,
	formatDate,
	getFullName,
	getRole,
	navigate,
} from '../../../shared/helpers';
import { ApolloCacheManager, dataService, ToastService } from '../../../shared/services';
import i18n from '../../../shared/translations/i18n';
import FilterTable, {
	FilterableColumn,
	getFilters,
} from '../../shared/components/FilterTable/FilterTable';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { CONTENT_PATH, ITEMS_PER_PAGE } from '../content.const';
import { DELETE_CONTENT, GET_CONTENT_PAGES } from '../content.gql';
import { ContentTableState } from '../content.types';
import { generateWhereObject } from '../helpers/filters';
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

	const fetchContentPages = useCallback(async () => {
		let variables: any;
		try {
			variables = {
				offset: (tableState.page || 0) * ITEMS_PER_PAGE,
				order: {
					[tableState.sort_column || 'updated_at']: tableState.sort_order || 'desc',
				},
				where: generateWhereObject(getFilters(tableState)),
			};
			const response = await dataService.query({
				query: GET_CONTENT_PAGES,
				variables,
			});

			const contentPagesArray: Avo.Content.Content[] | null = get(
				response,
				'data.app_content',
				[]
			);
			const contentPageCountTemp: number = get(
				response,
				'data.app_content_aggregate.aggregate.count',
				0
			);

			if (!contentPagesArray) {
				throw new CustomError('Response did not contain any content pages', null, {
					response,
				});
			}

			setContentPages(contentPagesArray);
			setContentPageCount(contentPageCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to get content pages from graphql', err, {
					variables,
					tableState,
					query: 'GET_CONTENT_PAGES',
				})
			);
			setLoadingInfo({
				state: 'error',
				message: t('Het ophalen van de content paginas is mislukt'),
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
	// TODO: clean up admin check
	const isAdminUser = get(user, 'role.name', null) === 'admin';

	const contentTypeOptions = contentTypes.map(
		(option): CheckboxOption => ({
			id: option.value,
			label: option.label,
			checked: get(tableState, 'content_type', [] as string[]).includes(option.value),
		})
	);

	const columnInfos: FilterableColumn[] = [
		{ id: 'title', label: i18n.t('admin/content/content___titel') },
		{
			id: 'content_type',
			label: i18n.t('admin/content/content___content-type'),
			filterType: 'CheckboxDropdownModal',
			filterProps: {
				id: 'content-filter-type',
				label: t('admin/content/components/content-filters/content-filters___type'),
				options: contentTypeOptions,
			},
		},
		{ id: 'author', label: i18n.t('admin/content/content___auteur') },
		{ id: 'role', label: i18n.t('admin/content/content___rol') },
		{
			id: 'created_at',
			label: i18n.t('admin/content/content___aangemaakt'),
			sortable: true,
			filterType: 'DateRangeDropdown',
			filterProps: {
				id: 'content-filter-created-date',
				label: t('admin/content/components/content-filters/content-filters___aanmaakdatum'),
			},
		},
		{
			id: 'updated_at',
			label: i18n.t('admin/content/content___laatst-bewerkt'),
			sortable: true,
			filterType: 'DateRangeDropdown',
			filterProps: {
				id: 'content-filter-updated-date',
				label: t('admin/content/components/content-filters/content-filters___bewerkdatum'),
			},
		},
		{
			id: 'publish_at',
			label: i18n.t('admin/content/content___publicatiedatum'),
			sortable: true,
			filterType: 'DateRangeDropdown',
			filterProps: {
				id: 'content-filter-publish-date',
				label: t(
					'admin/content/components/content-filters/content-filters___publiceerdatum'
				),
			},
		},
		{
			id: 'depublish_at',
			label: i18n.t('admin/content/content___depublicatiedatum'),
			sortable: true,
			filterType: 'DateRangeDropdown',
			filterProps: {
				id: 'content-filter-depublish-date',
				label: t(
					'admin/content/components/content-filters/content-filters___depubliceerdatum'
				),
			},
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
					columns={columnInfos}
					dataCount={contentPageCount}
					searchTextPlaceholder={t('Zoeken op auteur, titel')}
					noContentMatchingFiltersMessage={t(
						'admin/content/views/content-overview___er-is-geen-content-gevonden-die-voldoen-aan-uw-filters'
					)}
					renderNoResults={renderNoResults}
					renderTableCell={renderTableCell}
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
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={contentPages}
							render={renderContentOverview}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button
					label={t('admin/content/views/content-overview___content-toevoegen')}
					onClick={() => history.push(CONTENT_PATH.CONTENT_CREATE)}
				/>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default ContentOverview;
