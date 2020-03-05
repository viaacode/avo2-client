import { get } from 'lodash-es';
import React, { FunctionComponent, KeyboardEvent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';

import {
	Button,
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
import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { buildLink, formatDate } from '../../../shared/helpers';
import { useTableSort } from '../../../shared/hooks';
import { ToastService } from '../../../shared/services';
import { KeyCode } from '../../../shared/types';
import { ADMIN_PATH } from '../../admin.const';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import { USER_GROUP_OVERVIEW_TABLE_COLS } from '../user-group.const';
import { GET_USER_GROUPS } from '../user-group.gql';
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

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			setQueryText(searchFieldValue);
		}
	};

	const navigateToUserGroupDetail = (id: number | undefined) => {
		if (!id) {
			ToastService.danger(t('Deze gebruikersgroep heeft geen geldig id'));
			return;
		}
		const link = buildLink(ADMIN_PATH.USER_GROUP_DETAIL, { id });
		redirectToClientPage(link, history);
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
					<Button
						type="secondary"
						icon="eye"
						onClick={() => navigateToUserGroupDetail(rowData.id)}
					/>
				);

			default:
				return rowData[columnId];
		}
	};

	const renderUserGroupOverview = (response: any) => {
		const dbUserGroups: Partial<UserGroup>[] = get(response, 'users_groups', []);
		const userGroupCount = get(response, 'users_groups_aggregate.aggregate.count', 0);
		if (!userGroupCount) {
			return (
				<ErrorView message={t('Er bestaan nog geen gebruikersgroepen')}>
					<p>
						<Trans>Beschrijving wanneer er nog geen gebruikersgroepen zijn</Trans>
					</p>
				</ErrorView>
			);
		}

		return (
			<>
				<Table
					columns={USER_GROUP_OVERVIEW_TABLE_COLS}
					data={dbUserGroups}
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
						pageCount={Math.ceil(userGroupCount / ITEMS_PER_PAGE)}
						currentPage={page}
						onPageChange={setPage}
					/>
				</Spacer>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('Gebruikersgroepen')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<Spacer margin="bottom-small">
							<Toolbar>
								<ToolbarRight>
									<Form type="inline">
										<FormGroup
											className="c-content-filters__search"
											inlineMode="grow"
										>
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
						<DataQueryComponent
							renderData={renderUserGroupOverview}
							query={GET_USER_GROUPS}
							variables={{
								offset: page * ITEMS_PER_PAGE,
								limit: ITEMS_PER_PAGE,
								orderBy: [{ [sortColumn]: sortOrder }],
								queryText: `%${queryText}%`,
							}}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default UserGroupGroupOverview;
