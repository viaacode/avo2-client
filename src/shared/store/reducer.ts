import { createReducer } from '../helpers';

import initialState from './initial-state';
import { GlobalActionTypes, SetIsModalOpenAction } from './types';

const searchReducer = createReducer(initialState, {
	[GlobalActionTypes.SET_IS_MODAL_OPEN]: (state, action: SetIsModalOpenAction) => ({
		...state,
		isModalOpen: action.isModalOpen,
	}),
});

export default searchReducer;
