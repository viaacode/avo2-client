import { useMutation } from '@apollo/react-hooks';
import { cloneDeep, isEqual, startCase } from 'lodash-es';
import React, { FunctionComponent, useEffect, useRef, useState } from 'react';
import { RouteComponentProps, withRouter } from 'react-router';

import { Button, ButtonToolbar, Flex, IconName, Spacer, Table } from '@viaa/avo2-components';

import { DataQueryComponent } from '../../../shared/components/DataComponent/DataQueryComponent';
import DeleteObjectModal from '../../../shared/components/modals/DeleteObjectModal';
import { buildLink } from '../../../shared/helpers/generateLink';
import { ApolloCacheManager } from '../../../shared/services/data-service';
import toastService, { TOAST_TYPE } from '../../../shared/services/toast-service';
import {
	DELETE_MENU_ITEM,
	GET_MENU_ITEMS_BY_PLACEMENT,
	UPDATE_MENU_ITEM_BY_ID,
} from '../../admin.gql';
import { ADMIN_PATH } from '../../admin.routes';
import { MenuItem } from '../../admin.types';
import { AdminLayout, AdminLayoutActions, AdminLayoutBody } from '../../layouts';

import './MenuDetail.scss';

interface MenuDetailProps extends RouteComponentProps<{ menu: string }> {}

const MenuDetail: FunctionComponent<MenuDetailProps> = ({ history, match }) => {
	const [activeRow, setActiveRow] = useState<number | null>(null);
	const [isConfirmModalOpen, setIsConfirmModalOpen] = useState<boolean>(false);
	const [idToDelete, setIdToDelete] = useState<number | null>(null);
	const [isSaving, setIsSaving] = useState<boolean>(false);
	const [initialMenuItems, setInitialMenuItems] = useState<MenuItem[]>([]);
	const [menuItems, setMenuItems] = useState<MenuItem[]>([]);

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
				toastService(`Het navigatie item is succesvol verwijderd`, TOAST_TYPE.SUCCESS);
			})
			.catch(err => {
				console.error(err);
				toastService(
					`Er ging iets mis tijdens het verwijderen van het navigatie item`,
					TOAST_TYPE.DANGER
				);
			});
	};

	const handleNavigate = (path: string, params: { [key: string]: string } = {}): void => {
		history.push(buildLink(path, params));
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
				toastService('De navigatie items zijn succesvol opgeslagen', TOAST_TYPE.SUCCESS);
			})
			.catch(err => {
				console.error(err);
				toastService(
					'Er ging iets mis tijdens het opslaan van de navigatie items',
					TOAST_TYPE.DANGER
				);
			});
	};

	const openConfirmModal = (id: number): void => {
		setIdToDelete(id);
		setIsConfirmModalOpen(true);
	};

	const reindexMenuitems = (items: MenuItem[]): MenuItem[] =>
		items.map((item, index) => {
			item.position = index;
			// Remove properties that we don't need for save
			delete item.__typename;

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

	const renderMenuDetail = (menu: MenuItem[], refetch: () => void) => {
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
				navigateBack={() => handleNavigate(ADMIN_PATH.MENU)}
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
													handleNavigate(ADMIN_PATH.MENU_EDIT, {
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
									handleNavigate(ADMIN_PATH.MENU_CREATE, {
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
					<Button
						label="Annuleer"
						onClick={() => handleNavigate(ADMIN_PATH.MENU)}
						type="tertiary"
					/>
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
