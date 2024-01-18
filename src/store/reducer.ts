import { createReducer } from '../shared/helpers';

import initialState from './initial-state';
import { SetLastVideoPlayedAtAction, SetShowNudgingModalAction, UiStateActionTypes } from './types';

const uiStateReducer = createReducer(initialState, {
	[UiStateActionTypes.SET_SHOW_NUDGING_MODAL]: (state, action: SetShowNudgingModalAction) => ({
		...state,
		showNudgingModal: action.data,
	}),
	[UiStateActionTypes.SET_LAST_VIDEO_PLAYED_AT_ACTION]: (
		state,
		action: SetLastVideoPlayedAtAction
	) => ({
		...state,
		lastVideoPlayedAt: action.data,
	}),
});

export default uiStateReducer;
