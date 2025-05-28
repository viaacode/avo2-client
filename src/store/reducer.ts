import { createReducer } from '../shared/helpers/redux/create-reducer';

import initialState from './initial-state';
import {
	type SetLastVideoPlayedAtAction,
	type SetShowNudgingModalAction,
	UiStateActionTypes,
} from './types';

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
	[UiStateActionTypes.SET_HISTORY_LOCATIONS]: (state, action) => ({
		...state,
		historyLocations: action.data || [],
	}),
	[UiStateActionTypes.SET_EMBED_FLOW]: (state, action) => ({
		...state,
		embedFlow: action.data,
	}),
});

export default uiStateReducer;
