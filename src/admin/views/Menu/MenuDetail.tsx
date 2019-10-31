import React, { FunctionComponent, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Flex, IconName, Spacer, Table } from '@viaa/avo2-components';
import { cloneDeep, isEqual, isNull, startCase } from 'lodash-es';

import { DataQueryComponent } from '../../../shared/components/DataComponent/DataQueryComponent';
import { buildLink } from '../../../shared/helpers/generateLink';
import { GET_MENU_ITEMS_BY_PLACEMENT } from '../../graphql';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../layouts';
import { ADMIN_PATH } from '../../routes';
import { MenuItem } from '../../types';

import './MenuDetail.scss';

interface MenuDetailProps extends RouteComponentProps<{ menu: string }> {}

const MenuDetail: FunctionComponent<MenuDetailProps> = ({ history, match }) => {
	const [initialMenuItems, setInitialMenuItems] = useState<MenuItem[]>([]);
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
	const hasInitialData = useRef(false);

	// Computed
	const menuId = match.params.menu;

	// Methods
	const handleNavigate = (path: string, params: { [key: string]: string } = {}) => {
		history.push(buildLink(path, params));
	};

	const handleSave = () => {
		console.log('do stuff');
	};

	const reindexMenuitems = (items: MenuItem[]) =>
		items.map((item, index) => {
			item.position = index;

			return item;
		});

	const reorderMenuItem = (currentIndex: number, indexUpdate: number) => {
		const newIndex = currentIndex + indexUpdate;
		const menuItemsCopy = cloneDeep(menuItems);
		// Get updated item and remove it from copy
		const updatedItem = menuItemsCopy.splice(currentIndex, 1)[0];
		// Add item back at new index
		menuItemsCopy.splice(newIndex, 0, updatedItem);

		setMenuItems(menuItemsCopy);
	};

	// Render
	const renderReorderButton = (dir: 'up' | 'down', id: number) => {
		const decrease = dir === 'up';
		const indexUpdate = decrease ? -1 : 1;

		return (
			<Button
				icon={`chevron-${dir}` as IconName}
				onClick={() => reorderMenuItem(id, indexUpdate)}
				title={`Verplaats item naar ${decrease ? 'boven' : 'onder'}`}
				type="secondary"
			/>
		);
	};

	const renderMenuDetail = (menu: MenuItem[]) => {
		if (!hasInitialData.current) {
			hasInitialData.current = true;
			// Set items position property equal to index in array
			const reindexedMenuItems = reindexMenuitems(menu);

			setInitialMenuItems(reindexedMenuItems);
			setMenuItems(reindexedMenuItems);
		}

		const isFirst = (i: number) => i === 0;
		const isLast = (i: number) => i === menuItems.length - 1;

		return (
			<AdminLayout className="c-menu-detail" pageTitle={startCase(menuId)}>
				<AdminLayoutBody>
					<Table className="c-menu-detail__table" align variant="styled">
						<tbody>
							{menuItems.map((item, index) => (
								<tr key={`nav-edit-${item.id}`}>
									<td className="o-table-col-1">
										<ButtonToolbar>
											{!isFirst(index) && renderReorderButton('up', index)}
											{!isLast(index) && renderReorderButton('down', index)}
										</ButtonToolbar>
									</td>
									<td>{item.label}</td>
									<td>
										<ButtonToolbar>
											<Button
												icon="edit-2"
												onClick={() =>
													handleNavigate(ADMIN_PATH.MENU_EDIT, {
														menu: menuId,
														id: String(item.id),
													})
												}
												type="secondary"
											/>
										</ButtonToolbar>
									</td>
								</tr>
							))}
							<tr>
								<td colSpan={3}>
									<Spacer margin="top">
										<Flex center>
											<Button
												icon="plus"
												label="Voeg een item toe"
												onClick={() =>
													handleNavigate(ADMIN_PATH.MENU_CREATE, {
														menu: menuId,
													})
												}
												type="borderless"
											/>
										</Flex>
									</Spacer>
								</td>
							</tr>
						</tbody>
					</Table>
				</AdminLayoutBody>
				<AdminLayoutActions>
					<ButtonToolbar>
						<Button
							disabled={isEqual(initialMenuItems, menuItems)}
							label="Opslaan"
							onClick={handleSave}
						/>
						<Button
							label="Annuleer"
							onClick={() => handleNavigate(ADMIN_PATH.MENU)}
							type="tertiary"
						/>
					</ButtonToolbar>
				</AdminLayoutActions>
			</AdminLayout>
		);
	};

	return (
		<DataQueryComponent
			query={GET_MENU_ITEMS_BY_PLACEMENT}
			renderData={renderMenuDetail}
			resultPath="app_content_nav_elements"
			variables={{ placement: menuId }}
		/>
	);
};

export default withRouter(MenuDetail);
