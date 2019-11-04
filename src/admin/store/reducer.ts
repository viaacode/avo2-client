import { createReducer } from '../../shared/helpers/redux/create-reducer';
import initialState from './initial-state';
import { MenuActionTypes, SetMenuItemsAction } from './types';

const menuReducer = createReducer(initialState, {
	[MenuActionTypes.SET_MENU_ITEMS]: (state, action: SetMenuItemsAction) => ({
		...state,
		menuItems: action.menuItems,
	}),
});

export default menuReducer;
