import { MenuItem } from '../types';
import { MenuActionTypes } from './types';

export const setMenuItems = (menuItems: MenuItem[]) => ({
	menuItems,
	type: MenuActionTypes.SET_MENU_ITEMS,
});
