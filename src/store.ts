import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import menuReducer from './admin/store/reducer';
import { MenuState } from './admin/store/types';
import loginReducer from './authentication/store/reducer';
import { LoginState } from './authentication/store/types';
import searchReducer from './search/store/reducer';
import { SearchState } from './search/store/types';

export interface AppState {
	loginState: LoginState;
	menu: MenuState;
	search: SearchState;
}

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer<AppState>>({
		menu: menuReducer,
		search: searchReducer,
		loginState: loginReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
