import { get } from 'lodash-es';
import React, { FunctionComponent, KeyboardEvent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, Container, FormGroup, Pagination, Table, TextInput } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { buildLink } from '../../../shared/helpers';
import { KeyCode } from '../../../shared/types';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import { USER_OVERVIEW_TABLE_COLS, USER_PATH } from '../user.const';
import { GET_USERS } from '../user.gql';
import { UserOverviewTableCols } from '../user.types';

interface UserOverviewProps extends DefaultSecureRouteProps {}

const UserOverview: FunctionComponent<UserOverviewProps> = () => {
	const [t] = useTranslation();

	// Contains the value of the search field, without triggering a new search query
	const [searchFieldValue, setSearchFieldValue] = useState<string>('');
	// Contains the value of the search field when the user triggers a new search query
	// by pressing enter or pressing the search button
	const [queryString, setQueryString] = useState<string>('');
	const [page, setPage] = useState<number>(0);
	// const [users, setUsers] = useState<any>([]);

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			setQueryString(searchFieldValue);
		}
	};

	const renderTableCell = (rowData: Partial<Avo.User.User>, columnId: UserOverviewTableCols) => {
		const { id, first_name, last_name } = rowData;

		switch (columnId) {
			case 'name':
				return (
					<Link
						to={buildLink(USER_PATH.USER_DETAIL, { id })}
					>{`${first_name} ${last_name}`}</Link>
				);
			case 'actions':
				return null;
			default:
				return rowData[columnId];
		}
	};

	const renderUserOverview = (response: any) => {
		const dbUsers = get(response, 'users_profiles', []);
		const userCount = get(response, 'users_profiles_aggregate.aggregate.count', 0);
		if (!dbUsers.length) {
			return (
				<ErrorView message={t('Er bestaan nog geen gebruikers')}>
					<p>
						<Trans>Beschrijving wanneer er nog geen gebruikers zijn</Trans>
					</p>
				</ErrorView>
			);
		}

		// setUsers(dbUsers);

		return (
			<>
				<Table
					columns={USER_OVERVIEW_TABLE_COLS}
					data={dbUsers}
					renderCell={(rowData: Partial<Avo.User.User>, columnId: string) =>
						renderTableCell(rowData, columnId as UserOverviewTableCols)
					}
					rowKey="id"
					variant="bordered"
				/>
				<Pagination pageCount={userCount} currentPage={page} onPageChange={setPage} />
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('admin/user/views/user-overview___navigatie-overzicht')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<FormGroup className="c-content-filters__search" inlineMode="grow">
							<TextInput
								placeholder={t('Zoek op naam, email, stamboek, alias, ...')}
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
								onClick={() => setQueryString(searchFieldValue)}
							/>
						</FormGroup>
						<DataQueryComponent
							renderData={renderUserOverview}
							query={GET_USERS}
							variables={{
								offset: page * ITEMS_PER_PAGE,
								limit: ITEMS_PER_PAGE,
								queryString: `%${queryString}%`,
							}}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default UserOverview;
