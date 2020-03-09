import { isNil } from 'lodash-es';
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
import { formatDate, navigate } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { KeyCode } from '../../../shared/types';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import {
	ITEMS_PER_PAGE,
	PERMISSION_GROUP_OVERVIEW_TABLE_COLS,
	PERMISSION_GROUP_PATH,
} from '../permission-group.const';
import { PermissionGroupService } from '../permission-group.service';
import { PermissionGroup, PermissionGroupOverviewTableCols } from '../permission-group.types';
import './PermissionGroupOverview.scss';

interface PermissionGroupOverviewProps extends DefaultSecureRouteProps {}

const PermissionGroupOverview: FunctionComponent<PermissionGroupOverviewProps> = ({ history }) => {
	// Hooks
	const [permissionGroups, setPermissionGroups] = useState<PermissionGroup[] | null>(null);
	const [permissionGroupCount, setPermissionGroupCount] = useState<number>(0);
	const [permissionGroupIdToDelete, setPermissionGroupIdToDelete] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [queryText, setQueryText] = useState<string>('');
	const [searchTerm, setSearchTerm] = useState<string>('');
	const [page, setPage] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const [sortColumn, sortOrder, handleSortClick] = useTableSort<PermissionGroupOverviewTableCols>(
		'updated_at'
	);

	const [t] = useTranslation();

	const fetchPermissionGroups = useCallback(async () => {
		try {
			const [
				permissionGroupTemp,
				permissionGroupCountTemp,
			] = await PermissionGroupService.fetchPermissionGroups(
				page,
				sortColumn,
				sortOrder,
				queryText
			);

			setPermissionGroups(permissionGroupTemp);
			setPermissionGroupCount(permissionGroupCountTemp);
		} catch (err) {
			setLoadingInfo({
				state: 'error',
				message: t('Het ophalen van de permissie groepen is mislukt'),
			});
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
		await PermissionGroupService.deletePermissionGroup(permissionGroupIdToDelete);
	};

	const openModal = (permissionGroup: PermissionGroup): void => {
		setIsConfirmModalOpen(true);
		setPermissionGroupIdToDelete(permissionGroup.id);
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
								<FormGroup className="c-permission-group__search" inlineMode="grow">
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
