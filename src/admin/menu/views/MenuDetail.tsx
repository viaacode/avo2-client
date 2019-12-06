import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, isEqual, startCase } from 'lodash-es';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Flex, IconName, Spacer, Table } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DataQueryComponent, DeleteObjectModal } from '../../../shared/components';
import { navigate } from '../../../shared/helpers';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import toastService from '../../../shared/services/toast-service';

import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../shared/layouts';
import { MENU_PATH } from '../menu.const';
import { DELETE_MENU_ITEM, GET_MENU_ITEMS_BY_PLACEMENT, UPDATE_MENU_ITEM_BY_ID } from '../menu.gql';

import './MenuDetail.scss';

interface MenuDetailProps extends RouteComponentProps<{ menu: string }> {}

const MenuDetail: FunctionComponent<MenuDetailProps> = ({ history, match }) => {
	const [activeRow, setActiveRow] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [initialMenuItems, setInitialMenuItems] = useState<Avo.Menu.Menu[]>([]);
	const [menuItems, setMenuItems] = useState<Avo.Menu.Menu[]>([]);
	const [isSaving, setIsSaving] = useState<boolean>(false);

	const [triggerMenuItemDelete] = useMutation(DELETE_MENU_ITEM);
	const [triggerMenuItemUpdate] = useMutation(UPDATE_MENU_ITEM_BY_ID);

	const hasInitialData = useRef<boolean>(false);
	const timeout = useRef<NodeJS.Timeout | null>(null);

	useEffect(() => {
		// Reset active row to clear styling
		timeout.current = setTimeout(() => {
			setActiveRow(null);
		}, 1000);

		return () => {
			if (timeout.current) {
				clearTimeout(timeout.current);
			}
		};
	}, [activeRow]);

	// Computed
	const menuId = match.params.menu;

	// Methods
	const handleDelete = (refetch: () => void): void => {
		triggerMenuItemDelete({
			variables: { id: idToDelete },
			update: ApolloCacheManager.clearNavElementsCache,
		})
			.then(() => {
				refetch();
				toastService.success('Het navigatie item is succesvol verwijderd', false);
			})
			.catch(err => {
				console.error(err);
				toastService.danger('Het verwijderen van het navigatie item is mislukt', false);
			});
	};

	const handleNavigate = (path: string, params: { [key: string]: string } = {}): void => {
		navigate(history, path, params);
	};

	const handleSave = (refetch: () => void): void => {
		setIsSaving(true);

		const promises: Promise<any>[] = [];
		menuItems.forEach(menuItem => {
			promises.push(
				triggerMenuItemUpdate({
					variables: {
						id: menuItem.id,
						menuItem: {
							...menuItem,
							updated_at: new Date().toISOString(),
						},
					},
					update: ApolloCacheManager.clearNavElementsCache,
				})
			);
		});

		Promise.all(promises)
			.then(() => {
				refetch();
				toastService.success('De navigatie items zijn succesvol opgeslagen', false);
			})
			.catch(err => {
				console.error(err);
				toastService.danger('Het opslaan van de navigatie items is mislukt', false);
			});
	};

	const openConfirmModal = (id: number): void => {
		setIdToDelete(id);
		setIsConfirmModalOpen(true);
	};

	const reindexMenuitems = (items: Avo.Menu.Menu[]): Avo.Menu.Menu[] =>
		items.map((item, index) => {
			item.position = index;
			// Remove properties that we don't need for save
			delete (item as any).__typename;

			return item;
		});

	const reorderMenuItem = (currentIndex: number, indexUpdate: number, id: number): void => {
		const newIndex = currentIndex + indexUpdate;
		const menuItemsCopy = cloneDeep(menuItems);
		// Get updated item and remove it from copy
		const updatedItem = menuItemsCopy.splice(currentIndex, 1)[0];
		// Add item back at new index
		menuItemsCopy.splice(newIndex, 0, updatedItem);

		setActiveRow(id);
		setMenuItems(reindexMenuitems(menuItemsCopy));
	};

	// Render
	const renderReorderButton = (dir: 'up' | 'down', index: number, id: number) => {
		const decrease = dir === 'up';
		const indexUpdate = decrease ? -1 : 1;

		return (
			<Button
				icon={`chevron-${dir}` as IconName}
				onClick={() => reorderMenuItem(index, indexUpdate, id)}
				title={`Verplaats item naar ${decrease ? 'boven' : 'onder'}`}
				type="secondary"
			/>
		);
	};

	const renderMenuDetail = (menu: Avo.Menu.Menu[], refetch: () => void) => {
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
			<AdminLayout
				className="c-menu-detail"
				navigateBack={() => handleNavigate(MENU_PATH.MENU)}
				pageTitle={startCase(menuId)}
			>
				<AdminLayoutBody>
					<Table align className="c-menu-detail__table" variant="styled">
						<tbody>
							{menuItems.map((item, index) => (
								<tr
									key={`nav-edit-${item.id}`}
									className={activeRow === item.id ? 'c-menu-detail__table-row--active' : ''}
								>
									<td className="o-table-col-1">
										<ButtonToolbar>
											{!isFirst(index) && renderReorderButton('up', index, item.id)}
											{!isLast(index) && renderReorderButton('down', index, item.id)}
										</ButtonToolbar>
									</td>
									<td>{item.label}</td>
									<td>
										<ButtonToolbar>
											<Button
												icon="edit-2"
												onClick={() =>
													handleNavigate(MENU_PATH.MENU_EDIT, {
														menu: menuId,
														id: String(item.id),
													})
												}
												type="secondary"
											/>
											<Button
												icon="delete"
												onClick={() => openConfirmModal(item.id)}
												type="secondary"
											/>
										</ButtonToolbar>
									</td>
								</tr>
							))}
						</tbody>
					</Table>
					<Spacer margin="top">
						<Flex center>
							<Button
								icon="plus"
								label="Voeg een item toe"
								onClick={() =>
									handleNavigate(MENU_PATH.MENU_CREATE, {
										menu: menuId,
									})
								}
								type="borderless"
							/>
						</Flex>
					</Spacer>
					<DeleteObjectModal
						deleteObjectCallback={() => handleDelete(refetch)}
						isOpen={isConfirmModalOpen}
						onClose={() => setIsConfirmModalOpen(false)}
					/>
				</AdminLayoutBody>
				<AdminLayoutActions>
					<Button
						disabled={isEqual(initialMenuItems, menuItems) || isSaving}
						label="Opslaan"
						onClick={() => handleSave(refetch)}
					/>
					<Button label="Annuleer" onClick={() => handleNavigate(MENU_PATH.MENU)} type="tertiary" />
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
