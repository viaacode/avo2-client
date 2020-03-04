import { useMutation } from '@apollo/react-hooks';
import { get, isNil } from 'lodash-es';
import React, {
	FunctionComponent,
	KeyboardEvent,
	ReactElement,
	useCallback,
	useEffect,
	useState,
} from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Button,
	ButtonToolbar,
	Container,
	Form,
	FormGroup,
	Pagination,
	Spacer,
	Table,
	TextInput,
	Toolbar,
	ToolbarRight,
} from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { CustomError, formatDate, navigate } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { ApolloCacheManager, dataService, ToastService } from '../../../shared/services';
import { KeyCode } from '../../../shared/types';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import {
	ITEMS_PER_PAGE,
	PERMISSION_GROUP_OVERVIEW_TABLE_COLS,
	PERMISSION_GROUP_PATH,
} from '../permission-group.const';
import { DELETE_PERMISSION_GROUP, GET_PERMISSION_GROUPS } from '../permission-group.gql';
import { PermissionGroup, PermissionGroupOverviewTableCols } from '../permission-group.types';
import './PermissionGroupOverview.scss';

interface PermissionGroupOverviewProps extends DefaultSecureRouteProps {}

const PermissionGroupOverview: FunctionComponent<PermissionGroupOverviewProps> = ({ history }) => {
	// Hooks
	const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[] | null>(null);
	const [permissionGroupCount, setPermissionGroupCount] = useState<number>(0);
	const [permissionGroupToDelete, setPermissionGroupToDelete] = useState<PermissionGroup | null>(
		null
	);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [queryText, setQueryText] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [sortColumn, sortOrder, handleSortClick] = useTableSort<PermissionGroupOverviewTableCols>(
		'updated_at'
	);

	const [triggerPermissionGroupDelete] = useMutation(DELETE_PERMISSION_GROUP);
	const [t] = useTranslation();

	const fetchPermissionGroups = useCallback(async () => {
		let variables: any;
		try {
			variables = {
				offset: ITEMS_PER_PAGE * page,
				limit: ITEMS_PER_PAGE,
				orderBy: [{ [sortColumn]: sortOrder }],
				queryText: `%${queryText}%`,
			};
			const response = await dataService.query({
				variables,
				query: GET_PERMISSION_GROUPS,
			});
			const permissionGroups = get(response, 'data.users_permission_groups');
			const permissionGroupCount = get(
				response,
				'data.users_permission_groups_aggregate.aggregate.count'
			);

			if (!permissionGroups) {
				setLoadingInfo({
					state: 'error',
					message: t('Het ophalen van de permissie groepen is mislukt'),
				});
				return;
			}

			setPermissionGroups(permissionGroups);
			setPermissionGroupCount(permissionGroupCount);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch permission groups from graphql', err, {
					variables,
					query: 'GET_PERMISSION_GROUPS',
				})
			);
		}
	}, [setPermissionGroups, setLoadingInfo, t, page, queryText, sortColumn, sortOrder]);

	useEffect(() => {
		fetchPermissionGroups();
	}, [fetchPermissionGroups]);

	useEffect(() => {
		if (permissionGroups && !isNil(permissionGroupCount)) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [permissionGroups, permissionGroupCount]);

	// Methods
	const handleDelete = async () => {
		try {
			if (!permissionGroupToDelete) {
				return;
			}

			await triggerPermissionGroupDelete({
				variables: { id: permissionGroupToDelete.id },
				update: ApolloCacheManager.clearPermissionCache,
			});

			ToastService.success(t('De permissie groep is verwijdert'), false);
			fetchPermissionGroups();
		} catch (err) {
			console.error(
				new CustomError('permission group delete failed', err, {
					permissionGroupToDelete,
				})
			);
			ToastService.danger(t('Het verwijderen van de permissie groep is mislukt'), false);
		}
	};

	const openModal = (permissionGroup: PermissionGroup): void => {
		setIsConfirmModalOpen(true);
		setPermissionGroupToDelete(permissionGroup);
	};

	const handleKeyUp = (e: KeyboardEvent<HTMLInputElement>) => {
		if (e.keyCode === KeyCode.Enter) {
			setQueryText(searchTerm);
		}
	};

	// Render
	const renderTableCell = (
		rowData: PermissionGroup,
		columnId: PermissionGroupOverviewTableCols
	) => {
		switch (columnId) {
			case 'label':
			case 'description':
				return rowData[columnId];

			case 'created_at':
			case 'updated_at':
				return !!rowData[columnId] ? formatDate(rowData[columnId] as string) : '-';

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="info"
							onClick={() =>
								navigate(history, PERMISSION_GROUP_PATH.PERMISSION_GROUP_DETAIL, {
									id: rowData.id,
								})
							}
							size="small"
							ariaLabel={t('Bekijk de details van deze permissie groep')}
							title={t('Bekijk de details van deze permissie groep')}
							type="tertiary"
						/>
						<Button
							icon="edit"
							onClick={() =>
								navigate(history, PERMISSION_GROUP_PATH.PERMISSION_GROUP_EDIT, {
									id: rowData.id,
								})
							}
							size="small"
							ariaLabel={t('Bewerk deze permissie groep')}
							title={t('Bewerk deze permissie groep')}
							type="tertiary"
						/>
						<Button
							icon="delete"
							onClick={() => openModal(rowData)}
							size="small"
							ariaLabel={t('Verwijder deze permissie groep')}
							title={t('Verwijder deze permissie groep')}
							type="tertiary"
						/>
					</ButtonToolbar>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderPermissionGroupTable = () => {
		if (!permissionGroups) {
			return;
		}
		return !permissionGroups.length ? (
			<ErrorView message={t('Er zijn nog geen permissie groepen aangemaakt')}>
				<p>
					<Trans>
						Beschrijving wanneer er nog geen permissie groepen zijn aangemaakt
					</Trans>
				</p>
			</ErrorView>
		) : (
			<>
				<Table
					columns={PERMISSION_GROUP_OVERVIEW_TABLE_COLS}
					data={permissionGroups}
					emptyStateMessage={
						queryText
							? t(
									'Er zijn geen permissie groepen gevonden die voldoen aan je zoekterm'
							  )
							: t('Er zijn nog geen permissie groepen aangemaakt')
					}
					onColumnClick={columId => {
						setPage(0);
						handleSortClick(columId as PermissionGroupOverviewTableCols);
					}}
					renderCell={(rowData: PermissionGroup, columnId: string) =>
						renderTableCell(rowData, columnId as PermissionGroupOverviewTableCols)
					}
					rowKey="id"
					variant="bordered"
					sortColumn={sortColumn}
					sortOrder={sortOrder}
				/>
				<Spacer margin="top-small">
					<Pagination
						pageCount={Math.ceil(permissionGroupCount / ITEMS_PER_PAGE)}
						onPageChange={setPage}
						currentPage={page}
					/>
				</Spacer>
				<DeleteObjectModal
					deleteObjectCallback={() => handleDelete()}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</>
		);
	};

	const renderPermissionGroupFiltersAndBody = (): ReactElement => {
		return (
			<>
				<Spacer margin="bottom-small">
					<Toolbar>
						<ToolbarRight>
							<Form type="inline">
								<FormGroup className="c-content-filters__search" inlineMode="grow">
									<TextInput
										placeholder={t('Zoek op naam, beschrijving, ...')}
										icon="search"
										onChange={setSearchTerm}
										onKeyUp={handleKeyUp}
										value={searchTerm}
									/>
								</FormGroup>
								<FormGroup inlineMode="shrink">
									<Button
										label={t('Zoeken')}
										type="primary"
										onClick={() => setQueryText(searchTerm)}
									/>
								</FormGroup>
							</Form>
						</ToolbarRight>
					</Toolbar>
				</Spacer>
				{renderPermissionGroupTable()}
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('Permissie groepen overzicht')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={permissionGroups}
							render={renderPermissionGroupFiltersAndBody}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button
					label={t('Permissie groep toevoegen')}
					onClick={() => history.push(PERMISSION_GROUP_PATH.PERMISSION_GROUP_CREATE)}
				/>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default PermissionGroupOverview;
