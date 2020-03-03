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
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { redirectToClientPage } from '../../../authentication/helpers/redirects';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { buildLink, formatDate } from '../../../shared/helpers';
import { ToastService } from '../../../shared/services';
import { KeyCode } from '../../../shared/types';
import { ADMIN_PATH } from '../../admin.const';
import { ITEMS_PER_PAGE } from '../../content/content.const';
import { AdminLayout, AdminLayoutBody } from '../../shared/layouts';

import { USER_OVERVIEW_TABLE_COLS } from '../user.const';
import { GET_USERS } from '../user.gql';
import { UserOverviewTableCols } from '../user.types';

interface UserOverviewProps extends DefaultSecureRouteProps {}

const UserOverview: FunctionComponent<UserOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	// Contains the value of the search field, without triggering a new search query
	const [searchFieldValue, setSearchFieldValue] = useState<string>('');
	// Contains the value of the search field when the user triggers a new search query
	// by pressing enter or pressing the search button
	const [queryText, setQueryText] = useState<string>('');
	const [page, setPage] = useState<number>(0);
	// const [users, setUsers] = useState<any>([]);

	const handleKeyUp = (e: KeyboardEvent) => {
		if (e.keyCode === KeyCode.Enter) {
			setQueryText(searchFieldValue);
		}
	};

	const navigateToUserDetail = (id: string | undefined) => {
		if (!id) {
			ToastService.danger(t('Deze gebruiker heeft geen geldig id'));
			return;
		}
		const detailRoute = ADMIN_PATH.USER_DETAIL;
		const link = buildLink(detailRoute, { id });
		redirectToClientPage(link, history);
	};

	const renderTableCell = (
		rowData: Partial<Avo.User.Profile>,
		columnId: UserOverviewTableCols
	) => {
		const { id, user, stamboek, created_at } = rowData;

		switch (columnId) {
			case 'first_name':
				return get(user, 'first_name', '-');

			case 'last_name':
				return get(user, 'last_name', '-');

			case 'mail':
				return get(user, 'mail', 'Onbekend');

			case 'stamboek':
				return stamboek || '-';

			case 'created_at':
				return formatDate(created_at) || '-';

			case 'actions':
				return (
					<Button type="secondary" icon="eye" onClick={() => navigateToUserDetail(id)} />
				);

			default:
				return rowData[columnId];
		}
	};

	const renderUserOverview = (response: any) => {
		const dbProfiles: Partial<Avo.User.Profile>[] = get(response, 'users_profiles', []);
		const userCount = get(response, 'users_profiles_aggregate.aggregate.count', 0);
		if (!dbProfiles.length) {
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
					data={dbProfiles}
					renderCell={(rowData: Partial<Avo.User.Profile>, columnId: string) =>
						renderTableCell(rowData, columnId as UserOverviewTableCols)
					}
					rowKey="id"
					variant="bordered"
				/>
				<Spacer margin="top-large">
					<Pagination pageCount={userCount} currentPage={page} onPageChange={setPage} />
				</Spacer>
			</>
		);
	};

	return (
		<AdminLayout pageTitle={t('Gebruikers')}>
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
												placeholder={t(
													'Zoek op naam, email, stamboek, alias, ...'
												)}
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
							renderData={renderUserOverview}
							query={GET_USERS}
							variables={{
								offset: page * ITEMS_PER_PAGE,
								limit: ITEMS_PER_PAGE,
								queryText: `%${queryText}%`,
							}}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default UserOverview;
