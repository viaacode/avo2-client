import { get } from 'lodash-es';

import { GET_MENU_ITEM_BY_ID, GET_MENU_ITEMS_BY_PLACEMENT } from '../../admin/menu/menu.gql';
import { MenuSchema } from '../../admin/menu/menu.types';
import { dataService } from './data-service';

const MENU_RESULT_PATH = 'app_content_nav_elements';

export const fetchMenuItemById = async (id: number): Promise<MenuSchema | null> => {
	try {
		const response = await dataService.query({ query: GET_MENU_ITEM_BY_ID, variables: { id } });
		const menuItem: MenuSchema | null = get(response, `data.${MENU_RESULT_PATH}[0]`, null);

		return menuItem;
	} catch (err) {
		console.error(`Failed to fetch menu item with id: ${id}`);
		return null;
	}
};

export const fetchMenuItemsByPlacement = async (
	placement: string
): Promise<MenuSchema[] | null> => {
	try {
		const response = await dataService.query({
			query: GET_MENU_ITEMS_BY_PLACEMENT,
			variables: { placement },
		});
		const menuItems: MenuSchema[] | null = get(response, `data.${MENU_RESULT_PATH}`, null);

		return menuItems;
	} catch (err) {
		console.error(`Failed to fetch menu items`);
		return null;
	}
};
