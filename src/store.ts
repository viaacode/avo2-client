import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import loginReducer from './authentication/store/reducer';
import { LoginState } from './authentication/store/types';
import searchReducer from './search/store/reducer';
import { SearchState } from './search/store/types';
import globalReducer from './shared/store/reducer';
import { GlobalState } from './shared/store/types';

export interface AppState {
	loginState: LoginState;
	search: SearchState;
	globalState: GlobalState;
}

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer<AppState>>({
		search: searchReducer,
		loginState: loginReducer,
		globalState: globalReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
