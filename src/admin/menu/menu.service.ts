import { get } from 'lodash-es';

import { Avo } from '@viaa/avo2-types';

import { dataService } from '../../shared/services/data-service';

import { GET_MENU_ITEM_BY_ID, GET_MENU_ITEMS_BY_PLACEMENT, GET_MENUS } from './menu.gql';

const MENU_RESULT_PATH = 'app_content_nav_elements';

export const fetchMenuItemById = async (id: number): Promise<Avo.Menu.Menu | null> => {
	try {
		const response = await dataService.query({ query: GET_MENU_ITEM_BY_ID, variables: { id } });
		return get(response, `data.${MENU_RESULT_PATH}[0]`, null);
	} catch (err) {
		console.error(`Failed to fetch menu item with id: ${id}`);
		return null;
	}
};

export const fetchMenuItems = async (placement?: string): Promise<Avo.Menu.Menu[] | null> => {
	try {
		const queryOptions = {
			query: placement ? GET_MENU_ITEMS_BY_PLACEMENT : GET_MENUS,
			variables: placement ? { placement } : {},
		};
		const response = await dataService.query(queryOptions);
		return get(response, `data.${MENU_RESULT_PATH}`, null);
	} catch (err) {
		console.error('Failed to fetch menu items');
		return null;
	}
};
