import { Button, ButtonToolbar, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';
import { startCase } from 'lodash-es';
import React, { FunctionComponent, useState } from 'react';
import MetaTags from 'react-meta-tags';
import { Link } from 'react-router-dom';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { GENERATE_SITE_TITLE } from '../../../constants';
import { ErrorView } from '../../../error/views';
import { DataQueryComponent } from '../../../shared/components';
import { GetMenusDocument } from '../../../shared/generated/graphql-db-types';
import { buildLink, navigate } from '../../../shared/helpers';
import useTranslation from '../../../shared/hooks/useTranslation';
import { AdminLayout, AdminLayoutBody, AdminLayoutTopBarRight } from '../../shared/layouts';
import { GET_MENU_OVERVIEW_TABLE_COLS, MENU_PATH } from '../menu.const';
import { MenuOverviewTableCols } from '../menu.types';

type MenuOverviewProps = DefaultSecureRouteProps;

const MenuOverview: FunctionComponent<MenuOverviewProps> = ({ history }) => {
	const { tText, tHtml } = useTranslation();

	const [menus, setMenus] = useState<any>([]);

	const renderTableCell = (rowData: Partial<Avo.Menu.Menu>, columnId: MenuOverviewTableCols) => {
		const placement = rowData.placement || undefined;

		switch (columnId) {
			case 'placement':
				return (
					<Link to={buildLink(MENU_PATH.MENU_DETAIL, { menu: placement })}>
						{startCase(placement || '')}
					</Link>
				);
			case 'actions':
				return (
					<ButtonToolbar>
						<Button
							icon="eye"
							onClick={() =>
								navigate(history, MENU_PATH.MENU_DETAIL, { menu: placement })
							}
							size="small"
							title={tText(
								'admin/menu/views/menu-overview___bekijk-de-navigatie-items-voor-deze-navigatie-balk'
							)}
							ariaLabel={tText(
								'admin/menu/views/menu-overview___bekijk-de-navigatie-items-voor-deze-navigatie-balk'
							)}
							type="secondary"
						/>
						<Button
							icon="plus"
							onClick={() =>
								navigate(history, MENU_PATH.MENU_ITEM_CREATE, { menu: placement })
							}
							size="small"
							title={tText(
								'admin/menu/views/menu-overview___voeg-een-navigatie-item-toe-aan-deze-navigatie-balk'
							)}
							ariaLabel={tText(
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
					message={tText(
						'admin/menu/views/menu-overview___er-zijn-nog-geen-navigaties-aangemaakt'
					)}
				>
					<p>
						{tHtml(
							'admin/menu/views/menu-overview___beschrijving-hoe-navigatie-items-toe-te-voegen'
						)}
					</p>
					<Spacer margin="top">
						<Button
							icon="plus"
							label={tText('admin/menu/views/menu-overview___navigatie-toevoegen')}
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
		<AdminLayout
			pageTitle={tText('admin/menu/views/menu-overview___navigatie-overzicht')}
			size="large"
		>
			{!!menus.length && (
				<AdminLayoutTopBarRight>
					<Button
						label={tText('admin/menu/views/menu-overview___navigatie-toevoegen')}
						onClick={() => history.push(MENU_PATH.MENU_CREATE)}
					/>
				</AdminLayoutTopBarRight>
			)}
			<AdminLayoutBody>
				<MetaTags>
					<title>
						{GENERATE_SITE_TITLE(
							tText(
								'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-titel'
							)
						)}
					</title>
					<meta
						name="description"
						content={tText(
							'admin/menu/views/menu-overview___menu-overzicht-beheer-pagina-beschrijving'
						)}
					/>
				</MetaTags>
				<DataQueryComponent
					renderData={renderMenuOverview}
					resultPath="app_content_nav_elements"
					query={GetMenusDocument}
				/>
			</AdminLayoutBody>
		</AdminLayout>
	);
};

export default MenuOverview;
