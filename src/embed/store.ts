import { applyMiddleware, combineReducers, createStore, type Reducer } from 'redux';
import { composeWithDevTools } from 'redux-devtools-extension';
import thunk from 'redux-thunk';

import loginReducer from '../authentication/store/reducer';
import { type LoginState } from '../authentication/store/types';

export interface EmbedAppState {
	loginState: LoginState;
}

const middleware = [thunk];

export default createStore(
	combineReducers<Reducer<EmbedAppState>>({
		loginState: loginReducer,
	}),
	composeWithDevTools(applyMiddleware(...middleware))
);
