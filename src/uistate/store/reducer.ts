import { createReducer } from './../../shared/helpers';
import initialState from './initial-state';
import { SetShowNudgingModalAction, UiStateActionTypes } from './types';

const uiStateReducer = createReducer(initialState, {
	[UiStateActionTypes.SET_SHOW_NUDGING_MODAL]: (state, action: SetShowNudgingModalAction) => ({
		...state,
		showNudgingModal: action.data,
	}),
});

export default uiStateReducer;
