import { combineReducers, createStore, Reducer } from 'redux';
import { devToolsEnhancer } from 'redux-devtools-extension';

import searchReducer from './search/store/reducer';

export default createStore(
	combineReducers<Reducer>({
		search: searchReducer,
	}),
	devToolsEnhancer({})
);
