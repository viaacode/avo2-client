import { Action } from 'redux';

import { MenuItem } from '../types';

export enum MenuActionTypes {
	SET_MENU_ITEMS = '@@menu/SET_MENU_ITEMS',
}

export interface SetMenuItemsAction extends Action {
	menuItems: MenuItem[];
}

export interface MenuState {
	menuItems: MenuItem[];
}
