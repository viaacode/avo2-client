import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import searchReducer from './search/store/reducer';
import { SearchState } from './search/store/types';

interface AppState {
	search: SearchState;
}

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer<AppState>>({
		search: searchReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
