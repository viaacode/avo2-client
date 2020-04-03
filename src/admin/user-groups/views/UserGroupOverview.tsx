import { isNil } from 'lodash-es';
import React, { FunctionComponent, useCallback, useEffect, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import { Button, ButtonToolbar, Container, Spacer } from '@viaa/avo2-components';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { ErrorView } from '../../../error/views';
import {
	DeleteObjectModal,
	LoadingErrorLoadedComponent,
	LoadingInfo,
} from '../../../shared/components';
import { CustomError, formatDate, navigate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { ItemsTableState } from '../../items/items.types';
import FilterTable, { getFilters } from '../../shared/components/FilterTable/FilterTable';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';

import { getDateRangeFilters, getQueryFilter } from '../../shared/helpers/filters';
import {
	GET_USER_GROUP_OVERVIEW_TABLE_COLS,
	ITEMS_PER_PAGE,
	USER_GROUP_PATH,
} from '../user-group.const';
import { UserGroupService } from '../user-group.service';
import { UserGroup, UserGroupOverviewTableCols, UserGroupTableState } from '../user-group.types';

interface UserGroupOverviewProps extends DefaultSecureRouteProps {}

const UserGroupGroupOverview: FunctionComponent<UserGroupOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	const [userGroupIdToDelete, setUserGroupIdToDelete] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [userGroups, setUserGroups] = useState<UserGroup[] | null>(null);
	const [userGroupCount, setUserGroupCount] = useState<number>(0);
	const [loadingInfo, setLoadingInfo] = useState<LoadingInfo>({ state: 'loading' });
	const [tableState, setTableState] = useState<Partial<UserGroupTableState>>({});

	const fetchUserGroups = useCallback(async () => {
		const generateWhereObject = (filters: Partial<ItemsTableState>) => {
			const andFilters: any[] = [];
			andFilters.push(
				...getQueryFilter(filters.query, (queryWordWildcard: string) => [
					{ label: { _ilike: queryWordWildcard } },
					{ description: { _ilike: queryWordWildcard } },
				])
			);
			andFilters.push(...getDateRangeFilters(filters, ['created_at', 'updated_at']));
			return { _and: andFilters };
		};

		try {
			const [userGroupsTemp, userGroupCountTemp] = await UserGroupService.fetchUserGroups(
				tableState.page || 0,
				tableState.sort_column || 'label',
				tableState.sort_order || 'asc',
				generateWhereObject(getFilters(tableState))
			);
			setUserGroups(userGroupsTemp);
			setUserGroupCount(userGroupCountTemp);
		} catch (err) {
			console.error(
				new CustomError('Failed to fetch user groups from graphql', err, { tableState })
			);
			setLoadingInfo({
				state: 'error',
				message: t(
					'admin/user-groups/views/user-group-overview___het-ophalen-van-de-gebruikersgroepen-is-mislukt'
				),
			});
		}
	}, [setUserGroups, setLoadingInfo, t, tableState]);

	useEffect(() => {
		fetchUserGroups();
	}, [fetchUserGroups]);

	useEffect(() => {
		if (userGroups && !isNil(userGroupCount)) {
			setLoadingInfo({ state: 'loaded' });
		}
	}, [userGroups, userGroupCount]);

	const handleDelete = async () => {
		try {
			if (!userGroupIdToDelete) {
				ToastService.danger(
					t(
						'admin/user-groups/views/user-group-overview___het-verwijderen-van-de-gebruikersgroep-is-mislukt-probeer-de-pagina-te-herladen'
					),
					false
				);
				return;
			}

			await UserGroupService.deleteUserGroup(userGroupIdToDelete);
			await fetchUserGroups();
			ToastService.success(
				t('admin/user-groups/views/user-group-overview___de-gebruikersgroep-is-verwijdert'),
				false
			);
		} catch (err) {
			console.error(
				new CustomError('Failed to delete user group', err, {
					userGroupIdToDelete,
					query: 'DELETE_USER_GROUP',
				})
			);
			ToastService.danger(
				t(
					'admin/user-groups/views/user-group-overview___het-verwijderen-van-de-gebruikersgroep-is-mislukt'
				),
				false
			);
		}
	};

	const openModal = (userGroupId: number | undefined): void => {
		if (isNil(userGroupId)) {
			ToastService.danger(
				t(
					'admin/user-groups/views/user-group-overview___de-gebruikersgroep-kon-niet-worden-verwijdert-probeer-de-pagina-te-herladen'
				),
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
							title={t(
								'admin/user-groups/views/user-group-overview___bekijk-de-gebruikersgroep-details'
							)}
							ariaLabel={t(
								'admin/user-groups/views/user-group-overview___bekijk-de-gebruikersgroep-details'
							)}
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
							ariaLabel={t('admin/content/views/content-overview___pas-content-aan')}
							type="secondary"
						/>
						<Button
							icon="delete"
							onClick={() => openModal(rowData.id)}
							size="small"
							title={t('admin/content/views/content-overview___verwijder-content')}
							ariaLabel={t(
								'admin/content/views/content-overview___verwijder-content'
							)}
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
					'admin/user-groups/views/user-group-overview___er-zijn-nog-geen-gebruikersgroepen-aangemaakt'
				)}
			>
				<p>
					<Trans i18nKey="admin/user-groups/views/user-group-overview___beschrijving-hoe-gebruikersgroepen-toe-voegen">
						Beschrijving hoe gebruikersgroepen toe voegen
					</Trans>
				</p>
				<Spacer margin="top">
					<Button
						icon="plus"
						label={t(
							'admin/user-groups/views/user-group-overview___gebruikersgroep-aanmaken'
						)}
						onClick={() => history.push(USER_GROUP_PATH.USER_GROUP_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		);
	};

	const renderUserGroupPageBody = () => {
		if (!userGroups) {
			return null;
		}
		return (
			<>
				<FilterTable
					columns={GET_USER_GROUP_OVERVIEW_TABLE_COLS()}
					data={userGroups || []}
					dataCount={userGroupCount}
					renderCell={(rowData: Partial<UserGroup>, columnId: string) =>
						renderTableCell(rowData, columnId as UserGroupOverviewTableCols)
					}
					searchTextPlaceholder={t(
						'admin/user-groups/views/user-group-overview___zoek-op-label-beschrijving'
					)}
					renderNoResults={renderNoResults}
					onTableStateChanged={setTableState}
					itemsPerPage={ITEMS_PER_PAGE}
					noContentMatchingFiltersMessage={t(
						'admin/user-groups/views/user-group-overview___er-zijn-geen-gebruikersgroepen-die-voldoen-aan-de-filters'
					)}
				/>
				<DeleteObjectModal
					deleteObjectCallback={handleDelete}
					isOpen={isConfirmModalOpen}
					onClose={() => setIsConfirmModalOpen(false)}
				/>
			</>
		);
	};

	return (
		<AdminLayout
			pageTitle={t('admin/user-groups/views/user-group-overview___gebruikersgroepen')}
		>
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
					label={t(
						'admin/user-groups/views/user-group-overview___gebruikersgroep-toevoegen'
					)}
					onClick={() => {
						redirectToClientPage(USER_GROUP_PATH.USER_GROUP_CREATE, history);
					}}
				/>
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default UserGroupGroupOverview;
