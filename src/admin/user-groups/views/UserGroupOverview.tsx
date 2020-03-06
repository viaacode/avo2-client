import { get, isNil } from 'lodash-es';
import React, { FunctionComponent, KeyboardEvent, useCallback, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';

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
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { CustomError, formatDate, navigate } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { dataService, ToastService } from '../../../shared/services';
import { KeyCode } from '../../../shared/types';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { USER_GROUP_OVERVIEW_TABLE_COLS, USER_GROUP_PATH } from '../user-group.const';
import { GET_USER_GROUPS } from '../user-group.gql';
import { UserGroupService } from '../user-group.service';
import {
	PermissionGroupTableCols,
	UserGroup,
	UserGroupOverviewTableCols,
} from '../user-group.types';

interface UserGroupOverviewProps extends DefaultSecureRouteProps {}

const UserGroupGroupOverview: FunctionComponent<UserGroupOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	// Contains the value of the search field, without triggering a new search query
	const [searchFieldValue, setSearchFieldValue] = useState<string>('');
	// Contains the value of the search field when the userGroup triggers a new search query
	// by pressing enter or pressing the search button
	const [queryText, setQueryText] = useState<string>('');
	const [page, setPage] = useState<number>(0);
	const [sortColumn, sortOrder, handleSortClick] = useTableSort<PermissionGroupTableCols>(
		'label'
	);
	const [userGroupIdToDelete, setUserGroupIdToDelete] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [userGroups, setUserGroups] = useState<UserGroup[] | null>(null);
	const [userGroupCount, setUserGroupCount] = useState<number | null>(null);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });

	const fetchUserGroups = useCallback(async () => {
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
				query: GET_USER_GROUPS,
			});
			const userGroups = get(response, 'data.users_groups');
			const userGroupCount = get(response, 'data.users_groups_aggregate.aggregate.count');

			if (!userGroups) {
				setLoadingInfo({
					state: 'error',
					message: t('Het ophalen van de permissie groepen is mislukt'),
				});
				return;
			}

			setUserGroups(userGroups);
			setUserGroupCount(userGroupCount);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch user groups from graphql', err, {
					variables,
					query: 'GET_USER_GROUPS',
				})
			);
		}
	}, [setUserGroups, setLoadingInfo, t, page, queryText, sortColumn, sortOrder]);

	useEffect(() => {
		fetchUserGroups();
	}, [fetchUserGroups]);

	useEffect(() => {
		if (userGroups && !isNil(userGroupCount)) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [userGroups, userGroupCount]);

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			setQueryText(searchFieldValue);
		}
	};

	const handleDelete = async () => {
		try {
			if (!userGroupIdToDelete) {
				ToastService.danger(
					t(
						'Het verwijderen van de gebruikersgroep is mislukt, probeer de pagina te herladen'
					),
					false
				);
				return;
			}

			await UserGroupService.deleteUserGroup(userGroupIdToDelete);
			await fetchUserGroups();
			ToastService.success(t('De gebruikersgroep is verwijdert'), false);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete user group', err, {
					userGroupIdToDelete,
					query: 'DELETE_USER_GROUP',
				})
			);
			ToastService.danger(t('Het verwijderen van de gebruikersgroep is mislukt'), false);
		}
	};

	const openModal = (userGroupId: number | undefined): void => {
		if (isNil(userGroupId)) {
			ToastService.danger(
				t('De gebruikersgroep kon niet worden verwijdert, probeer de pagina te herladen'),
				false
			);
			return;
		}
		setUserGroupIdToDelete(userGroupId);
		setIsConfirmModalOpen(true);
	};

	const renderTableCell = (rowData: Partial<UserGroup>, columnId: UserGroupOverviewTableCols) => {
		switch (columnId) {
			case 'label':
			case 'description':
				return rowData[columnId] || '-';

			case 'created_at':
			case 'updated_at':
				return formatDate(rowData[columnId]) || '-';

			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							type="secondary"
							icon="eye"
							onClick={() =>
								navigate(history, USER_GROUP_PATH.USER_GROUP_DETAIL, {
									id: rowData.id,
								})
							}
						/>
						<Button
							icon="edit"
							onClick={() =>
								navigate(history, USER_GROUP_PATH.USER_GROUP_EDIT, {
									id: rowData.id,
								})
							}
							size="small"
							title={t('admin/content/views/content-overview___pas-content-aan')}
							type="secondary"
						/>
						<Button
							icon="delete"
							onClick={() => openModal(rowData.id)}
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

	const renderUserGroupTable = () => {
		return (
			<>
				<Table
					columns={USER_GROUP_OVERVIEW_TABLE_COLS}
					data={userGroups || []}
					renderCell={(rowData: Partial<UserGroup>, columnId: string) =>
						renderTableCell(rowData, columnId as UserGroupOverviewTableCols)
					}
					sortColumn={sortColumn}
					sortOrder={sortOrder}
					onColumnClick={columnId =>
						handleSortClick(columnId as UserGroupOverviewTableCols)
					}
					rowKey="id"
					variant="bordered"
				/>
				<Spacer margin="top-large">
					<Pagination
						pageCount={Math.ceil((userGroupCount || 0) / ITEMS_PER_PAGE)}
						currentPage={page}
						onPageChange={setPage}
					/>
				</Spacer>
			</>
		);
	};

	const renderUserGroupPageBody = () => {
		return (
			<>
				<Spacer margin="bottom-small">
					<Toolbar>
						<ToolbarRight>
							<Form type="inline">
								<FormGroup className="c-content-filters__search" inlineMode="grow">
									<TextInput
										placeholder={t('Zoek op label, beschrijving')}
										icon="search"
										onChange={setSearchFieldValue}
										onKeyUp={handleKeyUp}
										value={searchFieldValue}
									/>
								</FormGroup>
								<FormGroup inlineMode="shrink">
									<Button
										label={t(
											'admin/content/components/content-filters/content-filters___zoeken'
										)}
										type="primary"
										onClick={() => setQueryText(searchFieldValue)}
									/>
								</FormGroup>
							</Form>
						</ToolbarRight>
					</Toolbar>
				</Spacer>
				{renderUserGroupTable()}
				<DeleteObjectModal
					deleteObjectCallback={() => handleDelete()}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('Gebruikersgroepen')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<LoadingErrorLoadedComponent
							loadingInfo={loadingInfo}
							dataObject={userGroups}
							render={renderUserGroupPageBody}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				<Button
					label={t('Gebruikersgroep toevoegen')}
					onClick={() => {
						redirectToClientPage(USER_GROUP_PATH.USER_GROUP_CREATE, history);
					}}
				/>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default UserGroupGroupOverview;
