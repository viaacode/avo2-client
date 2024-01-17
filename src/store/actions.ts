import { SetLastVideoPlayedAtAction, SetShowNudgingModalAction, UiStateActionTypes } from './types';

export const setShowNudgingModalAction = (data: boolean): SetShowNudgingModalAction => ({
	data,
	type: UiStateActionTypes.SET_SHOW_NUDGING_MODAL,
});

export const setLastVideoPlayedAtAction = (data: Date | null): SetLastVideoPlayedAtAction => ({
	data,
	type: UiStateActionTypes.SET_LAST_VIDEO_PLAYED_AT_ACTION,
});
