import { startCase } from 'lodash-es';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DataQueryComponent } from '../../../shared/components';
import { navigate } from '../../../shared/helpers';

import { AdminLayout } from '../../shared/layouts';
import { MENU_OVERVIEW_TABLE_COLS, MENU_PATH } from '../menu.const';
import { GET_MENUS } from '../menu.gql';
import { MenuOverviewTableCols } from '../menu.types';

interface MenuOverviewProps extends RouteComponentProps {}

const MenuOverview: FunctionComponent<MenuOverviewProps> = ({ history }) => {
	const renderTableCell = (rowData: Partial<Avo.Menu.Menu>, columnId: MenuOverviewTableCols) => {
		switch (columnId) {
			case 'placement':
				return startCase(rowData.placement);
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="list"
							onClick={() => navigate(history, MENU_PATH.MENU_DETAIL, { menu: rowData.placement })}
							size="small"
							title="Bekijk alle navigatie items"
							type="tertiary"
						/>
						<Button
							icon="plus"
							onClick={() => navigate(history, MENU_PATH.MENU_CREATE, { menu: rowData.placement })}
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

	const renderMenuOverview = (data: Partial<Avo.Menu.Menu>[]) => {
		return (
			<Table
				columns={MENU_OVERVIEW_TABLE_COLS}
				data={data}
				renderCell={(rowData: Partial<Avo.Menu.Menu>, columnId: string) =>
					renderTableCell(rowData, columnId as MenuOverviewTableCols)
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
