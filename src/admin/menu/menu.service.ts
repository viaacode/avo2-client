import { Avo } from '@viaa/avo2-types';
import { get, isNil } from 'lodash-es';

import {
	GetMenuItemByIdDocument,
	GetMenuItemByIdQuery,
	InsertMenuItemDocument,
	InsertMenuItemMutation,
} from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { ApolloCacheManager, dataService } from '../../shared/services';

const MENU_RESULT_PATH = 'app_content_nav_elements';

export class MenuService {
	public static async fetchMenuItemById(id: number): Promise<Avo.Menu.Menu | null> {
		try {
			const response = await dataService.query<GetMenuItemByIdQuery>({
				query: GetMenuItemByIdDocument,
				variables: { id },
			});

			return get(response, `data.${MENU_RESULT_PATH}[0]`, null);
		} catch (err) {
			throw new CustomError(`Failed to fetch menu item by id`, err, {
				id,
				query: 'GET_MENU_ITEM_BY_ID',
			});
		}
	}

	public static async fetchMenuItems(placement?: string): Promise<Avo.Menu.Menu[]> {
		try {
			const queryOptions = {
				query: placement ? GET_MENU_ITEMS_BY_PLACEMENT : GET_MENUS,
				variables: placement ? { placement } : {},
			};
			const response = await dataService.query(queryOptions);

			if (!response) {
				throw new CustomError('Response is undefined');
			}

			return get(response, `data.${MENU_RESULT_PATH}`, []);
		} catch (err) {
			throw new CustomError('Failed to fetch menu items', err, {
				placement,
				query: ['GET_MENU_ITEMS_BY_PLACEMENT', 'GET_MENUS'],
			});
		}
	}

	public static async insertMenuItem(menuItem: Partial<Avo.Menu.Menu>): Promise<number> {
		try {
			const response = await dataService.query<InsertMenuItemMutation>({
				query: InsertMenuItemDocument,
				variables: {
					menuItem,
				},
				update: ApolloCacheManager.clearNavElementsCache,
			});
			const id = get(response, 'data.insert_app_content_nav_elements.returning[0].id');
			if (isNil(id)) {
				throw new CustomError('Response does not contain inserted id', null, { response });
			}
			return id;
		} catch (err) {
			throw new CustomError('Failed to insert menu item', err, {
				menuItem,
				query: 'INSERT_MENU_ITEM',
			});
		}
	}

	public static async updateMenuItems(menuItems: Avo.Menu.Menu[]): Promise<void> {
		try {
			const promises: Promise<any>[] = menuItems.map((menuItem) => {
				return dataService.mutate({
					mutation: UPDATE_MENU_ITEM_BY_ID,
					variables: {
						id: menuItem.id,
						menuItem: {
							...menuItem,
							updated_at: new Date().toISOString(),
						},
					},
					update: ApolloCacheManager.clearNavElementsCache,
				});
			});

			await Promise.all(promises);
		} catch (err) {
			throw new CustomError('Failed to update menu items', err, {
				menuItems,
				query: 'UPDATE_MENU_ITEM_BY_ID',
			});
		}
	}

	public static async deleteMenuItem(id: number): Promise<void> {
		try {
			await dataService.query<DeleteMenuItemMutation>({
				query: DeleteMenuItemDocument,
				variables: { id },
				update: ApolloCacheManager.clearNavElementsCache,
			});
		} catch (err) {
			throw new CustomError('Failed to delete menu item by id', err, {
				id,
				query: 'DELETE_MENU_ITEM',
			});
		}
	}
}
