import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { collectionReducer, collectionsReducer } from './collection/store/reducer';
import itemReducer from './item/store/reducer';
import searchReducer from './search/store/reducer';

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer>({
		search: searchReducer,
		item: itemReducer,
		collection: collectionReducer,
		collections: collectionsReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
