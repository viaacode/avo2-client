import { applyMiddleware, combineReducers, createStore, type Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import loginReducer from './authentication/store/reducer';
import { type LoginState } from './authentication/store/types';
import searchReducer from './search/store/reducer';
import { type SearchState } from './search/store/types';
import uiStateReducer from './store/reducer';

export interface AppState {
	loginState: LoginState;
	search: SearchState;
	uiState: {
		showNudgingModal: boolean | null;
		lastVideoPlayedAt: Date | null;
	};
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
