import { Avo } from '@viaa/avo2-types';
import { isNil } from 'lodash-es';

import {
	DeleteMenuItemByIdDocument,
	DeleteMenuItemByIdMutation,
	GetMenuItemByIdDocument,
	GetMenuItemByIdQuery,
	GetMenuItemsByPlacementDocument,
	GetMenuItemsByPlacementQuery,
	GetMenusDocument,
	GetMenusQuery,
	InsertMenuItemDocument,
	InsertMenuItemMutation,
	UpdateMenuItemByIdDocument,
	UpdateMenuItemByIdMutation,
	UpdateMenuItemByIdMutationVariables,
} from '../../shared/generated/graphql-db-types';
import { CustomError } from '../../shared/helpers';
import { dataService } from '../../shared/services/data-service';

export class MenuService {
	public static async fetchMenuItemById(id: number): Promise<Avo.Menu.Menu | null> {
		try {
			const response = await dataService.query<GetMenuItemByIdQuery>({
				query: GetMenuItemByIdDocument,
				variables: { id },
			});

			return (response.app_content_nav_elements[0] || null) as Avo.Menu.Menu | null;
		} catch (err) {
			throw new CustomError(`Failed to fetch menu item by id`, err, {
				id,
				query: 'GET_MENU_ITEM_BY_ID',
			});
		}
	}

	public static async fetchMenuItems(placement?: string): Promise<Avo.Menu.Menu[]> {
		try {
			const variables = placement ? { placement } : {};
			const response = await dataService.query<
				typeof placement extends string ? GetMenuItemsByPlacementQuery : GetMenusQuery
			>({
				query: placement ? GetMenuItemsByPlacementDocument : GetMenusDocument,
				variables,
			});

			if (!response) {
				throw new CustomError('Response is undefined');
			}

			return (response.app_content_nav_elements || []) as Avo.Menu.Menu[];
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
			});
			const id = response.insert_app_content_nav_elements?.returning?.[0]?.id;
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
				const variables: UpdateMenuItemByIdMutationVariables = {
					id: menuItem.id,
					menuItem: {
						...menuItem,
						updated_at: new Date().toISOString(),
					},
				};
				return dataService.query<UpdateMenuItemByIdMutation>({
					query: UpdateMenuItemByIdDocument,
					variables,
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
			await dataService.query<DeleteMenuItemByIdMutation>({
				query: DeleteMenuItemByIdDocument,
				variables: { id },
			});
		} catch (err) {
			throw new CustomError('Failed to delete menu item by id', err, {
				id,
				query: 'DELETE_MENU_ITEM',
			});
		}
	}
}
