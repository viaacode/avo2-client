import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import loginReducer from './authentication/store/reducer';
import { LoginState } from './authentication/store/types';
import searchReducer from './search/store/reducer';
import { SearchState } from './search/store/types';

export interface AppState {
	loginState: LoginState;
	search: SearchState;
	loginState: LoginState;
}

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer<AppState>>({
		search: searchReducer,
		loginState: loginReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
