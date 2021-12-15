import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import loginReducer from './authentication/store/reducer';
import { LoginState } from './authentication/store/types';
import searchReducer from './search/store/reducer';
import { SearchState } from './search/store/types';
import uiStateReducer from './uistate/store/reducer';

export interface AppState {
	loginState: LoginState;
	search: SearchState;
	uiState: Record<string, string | boolean>;
}

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer<AppState>>({
		search: searchReducer,
		loginState: loginReducer,
		uiState: uiStateReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
