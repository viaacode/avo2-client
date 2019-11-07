import { get } from 'lodash-es';

import { GET_MENU_ITEM_BY_ID } from '../../admin/admin.gql';
import { MenuItem } from '../../admin/admin.types';
import { dataService } from './data-service';

export const fetchMenuItemById = async (id: number): Promise<MenuItem | null> => {
	try {
		const response = await dataService.query({ query: GET_MENU_ITEM_BY_ID, variables: { id } });
		const menuItem: MenuItem | null = get(response, 'data.app_content_nav_elements[0]', null);

		return menuItem;
	} catch (err) {
		console.error(`Failed to fetch menu item with id: ${id}`);
		return null;
	}
};
