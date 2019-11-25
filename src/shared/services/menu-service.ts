import { get } from 'lodash-es';

import { GET_MENU_ITEM_BY_ID, GET_MENU_ITEMS_BY_PLACEMENT } from '../../admin/admin.gql';
import { MenuItem } from '../../admin/admin.types';
import { dataService } from './data-service';

const MENU_RESULT_PATH = 'app_content_nav_elements';

export const fetchMenuItemById = async (id: number): Promise<MenuItem | null> => {
	try {
		const response = await dataService.query({ query: GET_MENU_ITEM_BY_ID, variables: { id } });
		const menuItem: MenuItem | null = get(response, `data.${MENU_RESULT_PATH}[0]`, null);

		return menuItem;
	} catch (err) {
		console.error(`Failed to fetch menu item with id: ${id}`);
		return null;
	}
};

export const fetchMenuItemsByPlacement = async (placement: string): Promise<MenuItem[] | null> => {
	try {
		const response = await dataService.query({
			query: GET_MENU_ITEMS_BY_PLACEMENT,
			variables: { placement },
		});
		const menuItems: MenuItem[] | null = get(response, `data.${MENU_RESULT_PATH}`, null);

		return menuItems;
	} catch (err) {
		console.error(`Failed to fetch menu items`);
		return null;
	}
};
