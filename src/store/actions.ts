import {
	type SetEmbedFlowAction,
	type SetHistoryLocationsAction,
	type SetLastVideoPlayedAtAction,
	type SetShowNudgingModalAction,
	UiStateActionTypes,
} from './types';

export const setShowNudgingModalAction = (data: boolean): SetShowNudgingModalAction => ({
	data,
	type: UiStateActionTypes.SET_SHOW_NUDGING_MODAL,
});

export const setLastVideoPlayedAtAction = (data: Date | null): SetLastVideoPlayedAtAction => ({
	data,
	type: UiStateActionTypes.SET_LAST_VIDEO_PLAYED_AT_ACTION,
});

export const setHistoryLocationsAction = (data: string[]): SetHistoryLocationsAction => ({
	data,
	type: UiStateActionTypes.SET_HISTORY_LOCATIONS,
});

export const setEmbedFlowAction = (data: string): SetEmbedFlowAction => ({
	data,
	type: UiStateActionTypes.SET_EMBED_FLOW,
});
