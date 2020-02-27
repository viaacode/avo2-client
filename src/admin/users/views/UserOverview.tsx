import { startCase } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { Trans, useTranslation } from 'react-i18next';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, Container, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { buildLink, navigate } from '../../../shared/helpers';

import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';
import { USER_OVERVIEW_TABLE_COLS, USER_PATH } from '../user.const';
import { GET_USERS } from '../user.gql';
import { UserOverviewTableCols } from '../user.types';

interface UserOverviewProps extends DefaultSecureRouteProps {}

const UserOverview: FunctionComponent<UserOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	const [users, setUsers] = useState<any>([]);

	const renderTableCell = (rowData: Partial<Avo.User.User>, columnId: UserOverviewTableCols) => {
		const { placement: user } = rowData;

		switch (columnId) {
			case 'placement':
				return (
					<Link to={buildLink(USER_PATH.USER_DETAIL, { user })}>{startCase(user)}</Link>
				);
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="list"
							onClick={() => navigate(history, USER_PATH.USER_DETAIL, { user })}
							size="small"
							title={t(
								'admin/user/views/user-overview___bekijk-alle-navigatie-items'
							)}
							type="tertiary"
						/>
						<Button
							icon="plus"
							onClick={() => navigate(history, USER_PATH.USER_ITEM_CREATE, { user })}
							size="small"
							title={t(
								'admin/user/views/user-overview___voeg-een-navigatie-item-toe'
							)}
							type="tertiary"
						/>
					</ButtonToolbar>
				);
			default:
				return rowData[columnId];
		}
	};

	const renderUserOverview = (data: Partial<Avo.User.User>[]) => {
		if (!data.length) {
			return (
				<ErrorView
					message={t(
						'admin/user/views/user-overview___er-zijn-nog-geen-navigaties-aangemaakt'
					)}
				>
					<p>
						<Trans i18nKey="admin/user/views/user-overview___beschrijving-hoe-navigatie-items-toe-te-voegen">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid
							ab debitis blanditiis vitae molestiae delectus earum asperiores
							mollitia, minima laborum expedita ratione quas impedit repudiandae nisi
							corrupti quis eaque!
						</Trans>
					</p>
					<Spacer margin="top">
						<Button
							icon="plus"
							label={t('admin/user/views/user-overview___navigatie-toevoegen')}
							onClick={() => history.push(USER_PATH.USER_CREATE)}
						/>
					</Spacer>
				</ErrorView>
			);
		}

		setUsers(data);

		return (
			<Table
				columns={USER_OVERVIEW_TABLE_COLS}
				data={data}
				renderCell={(rowData: Partial<Avo.User.User>, columnId: string) =>
					renderTableCell(rowData, columnId as UserOverviewTableCols)
				}
				rowKey="id"
				variant="bordered"
			/>
		);
	};

	return (
		<AdminLayout pageTitle={t('admin/user/views/user-overview___navigatie-overzicht')}>
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<DataQueryComponent
							renderData={renderUserOverview}
							resultPath="app_content_nav_elements"
							query={GET_USERS}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			{!!users.length && (
				<AdminLayoutActions>
					<Button
						label={t('admin/user/views/user-overview___navigatie-toevoegen')}
						onClick={() => history.push(USER_PATH.USER_CREATE)}
					/>
				</AdminLayoutActions>
			)}
		</AdminLayout>
	);
};

export default UserOverview;
