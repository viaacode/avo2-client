import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Table } from '@viaa/avo2-components';
import { startCase } from 'lodash-es';

import { DataQueryComponent } from '../../../shared/components/DataComponent/DataQueryComponent';
import { buildLink } from '../../../shared/helpers/generateLink';
import { MENU_OVERVIEW_TABLE_COLS } from '../../constants';
import { GET_MENUS } from '../../graphql';
import { AdminLayout } from '../../layouts';
import { ADMIN_PATH } from '../../routes';
import { MenuItem, MenuOverviewTableCols } from '../../types';

interface MenuOverviewProps extends RouteComponentProps {}

const MenuOverview: FunctionComponent<MenuOverviewProps> = ({ history }) => {
	// Render
	const renderCell = (rowData: Partial<MenuItem>, columnId: MenuOverviewTableCols) => {
		switch (columnId) {
			case 'placement':
				return startCase(rowData.placement);
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="list"
							onClick={() =>
								history.push(buildLink(ADMIN_PATH.MENU_DETAIL, { menu: rowData.placement }))
							}
							size="small"
							title="Bekijk alle navigatie items"
							type="tertiary"
						/>
						<Button
							icon="plus"
							onClick={() =>
								history.push(buildLink(ADMIN_PATH.MENU_CREATE, { menu: rowData.placement }))
							}
							size="small"
							title="Voeg een navigatie item toe"
							type="tertiary"
						/>
					</ButtonToolbar>
				);
			default:
				return rowData[columnId];
		}
	};

	const renderMenuOverview = (data: Partial<MenuItem>[]) => {
		return (
			<Table
				columns={MENU_OVERVIEW_TABLE_COLS}
				data={data}
				renderCell={(rowData: Partial<MenuItem>, columnId: string) =>
					renderCell(rowData, columnId as MenuOverviewTableCols)
				}
				rowKey="id"
				variant="bordered"
			/>
		);
	};

	return (
		<AdminLayout pageTitle="Navigatie overzicht">
			<DataQueryComponent
				renderData={renderMenuOverview}
				resultPath="app_content_nav_elements"
				query={GET_MENUS}
			/>
		</AdminLayout>
	);
};

export default withRouter(MenuOverview);
