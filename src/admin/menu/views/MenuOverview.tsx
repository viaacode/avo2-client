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

import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { GET_MENU_OVERVIEW_TABLE_COLS, MENU_PATH } from '../menu.const';
import { GET_MENUS } from '../menu.gql';
import { MenuOverviewTableCols } from '../menu.types';

interface MenuOverviewProps extends DefaultSecureRouteProps {}

const MenuOverview: FunctionComponent<MenuOverviewProps> = ({ history }) => {
	const [t] = useTranslation();

	const [menus, setMenus] = useState<any>([]);

	const renderTableCell = (rowData: Partial<Avo.Menu.Menu>, columnId: MenuOverviewTableCols) => {
		const { placement: menu } = rowData;

		switch (columnId) {
			case 'placement':
				return (
					<Link to={buildLink(MENU_PATH.MENU_DETAIL, { menu })}>{startCase(menu)}</Link>
				);
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="eye"
							onClick={() => navigate(history, MENU_PATH.MENU_DETAIL, { menu })}
							size="small"
							title={t(
								'admin/menu/views/menu-overview___bekijk-de-navigatie-items-voor-deze-navigatie-balk'
							)}
							ariaLabel={t(
								'admin/menu/views/menu-overview___bekijk-de-navigatie-items-voor-deze-navigatie-balk'
							)}
							type="secondary"
						/>
						<Button
							icon="plus"
							onClick={() => navigate(history, MENU_PATH.MENU_ITEM_CREATE, { menu })}
							size="small"
							title={t(
								'admin/menu/views/menu-overview___voeg-een-navigatie-item-toe-aan-deze-navigatie-balk'
							)}
							ariaLabel={t(
								'admin/menu/views/menu-overview___voeg-een-navigatie-item-toe-aan-deze-navigatie-balk'
							)}
							type="secondary"
						/>
					</ButtonToolbar>
				);
			default:
				return rowData[columnId];
		}
	};

	const renderMenuOverview = (data: Partial<Avo.Menu.Menu>[]) => {
		if (!data.length) {
			return (
				<ErrorView
					message={t(
						'admin/menu/views/menu-overview___er-zijn-nog-geen-navigaties-aangemaakt'
					)}
				>
					<p>
						<Trans i18nKey="admin/menu/views/menu-overview___beschrijving-hoe-navigatie-items-toe-te-voegen">
							Lorem ipsum dolor sit amet consectetur adipisicing elit. Maiores aliquid
							ab debitis blanditiis vitae molestiae delectus earum asperiores
							mollitia, minima laborum expedita ratione quas impedit repudiandae nisi
							corrupti quis eaque!
						</Trans>
					</p>
					<Spacer margin="top">
						<Button
							icon="plus"
							label={t('admin/menu/views/menu-overview___navigatie-toevoegen')}
							onClick={() => history.push(MENU_PATH.MENU_CREATE)}
							type="primary"
						/>
					</Spacer>
				</ErrorView>
			);
		}

		setMenus(data);

		return (
			<Table
				columns={GET_MENU_OVERVIEW_TABLE_COLS()}
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
		<AdminLayout pageTitle={t('admin/menu/views/menu-overview___navigatie-overzicht')}>
			{!!menus.length && (
				<AdminLayoutTopBarRight>
					<Button
						label={t('admin/menu/views/menu-overview___navigatie-toevoegen')}
						onClick={() => history.push(MENU_PATH.MENU_CREATE)}
					/>
				</AdminLayoutTopBarRight>
			)}
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
		</AdminLayout>
	);
};

export default MenuOverview;
