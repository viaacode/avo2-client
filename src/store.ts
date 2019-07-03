import { applyMiddleware, combineReducers, createStore, Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import detailReducer from './detail/store/reducer';
import searchReducer from './search/store/reducer';

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer>({
		search: searchReducer,
		detail: detailReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
