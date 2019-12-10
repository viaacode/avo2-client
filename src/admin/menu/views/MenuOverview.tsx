import { startCase } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';
import { Link } from 'react-router-dom';

import { Button, ButtonToolbar, Container, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { buildLink, navigate } from '../../../shared/helpers';

import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';
import { MENU_OVERVIEW_TABLE_COLS, MENU_PATH } from '../menu.const';
import { GET_MENUS } from '../menu.gql';
import { MenuOverviewTableCols } from '../menu.types';

interface MenuOverviewProps extends RouteComponentProps {}

const MenuOverview: FunctionComponent<MenuOverviewProps> = ({ history }) => {
	const [menus, setMenus] = useState<any>([]);

	const renderTableCell = (rowData: Partial<Avo.Menu.Menu>, columnId: MenuOverviewTableCols) => {
		const { placement: menu } = rowData;

		switch (columnId) {
			case 'placement':
				return <Link to={buildLink(MENU_PATH.MENU_DETAIL, { menu })}>{startCase(menu)}</Link>;
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="list"
							onClick={() => navigate(history, MENU_PATH.MENU_DETAIL, { menu })}
							size="small"
							title="Bekijk alle navigatie items"
							type="tertiary"
						/>
						<Button
							icon="plus"
							onClick={() => navigate(history, MENU_PATH.MENU_ITEM_CREATE, { menu })}
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
		if (data.length) {
			setMenus(data);
		}

		return !data.length ? (
			<ErrorView message="Er zijn nog geen navigaties aangemaakt.">
				<p>
					Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid ab debitis
					blanditiis vitae molestiae delectus earum asperiores mollitia, minima laborum expedita
					ratione quas impedit repudiandae nisi corrupti quis eaque!
				</p>
				<Spacer margin="top">
					<Button
						icon="plus"
						label="Navigatie toevoegen"
						onClick={() => history.push(MENU_PATH.MENU_CREATE)}
					/>
				</Spacer>
			</ErrorView>
		) : (
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
			<AdminLayoutBody>
				<Container mode="vertical" size="small">
					<Container mode="horizontal">
						<DataQueryComponent
							renderData={renderMenuOverview}
							resultPath="app_content_nav_elements"
							query={GET_MENUS}
						/>
					</Container>
				</Container>
			</AdminLayoutBody>
			<AdminLayoutActions>
				{!!menus.length ? (
					<Button label="Navigatie toevoegen" onClick={() => history.push(MENU_PATH.MENU_CREATE)} />
				) : null}
			</AdminLayoutActions>
		</AdminLayout>
	);
};

export default withRouter(MenuOverview);
