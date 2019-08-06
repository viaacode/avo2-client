import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import { collectionReducer, collectionsReducer } from './collection/store/reducer';
import { CollectionsState, CollectionState } from './collection/store/types';
import itemReducer from './item/store/reducer';
import { ItemState } from './item/store/types';
import searchReducer from './search/store/reducer';
import { SearchState } from './search/store/types';

interface AppState {
	collection: CollectionState;
	collections: CollectionsState;
	item: ItemState;
	search: SearchState;
}

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer<AppState>>({
		search: searchReducer,
		item: itemReducer,
		collection: collectionReducer,
		collections: collectionsReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
