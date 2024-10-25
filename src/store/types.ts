import { type Action } from 'redux';

export enum UiStateActionTypes {
	SET_SHOW_NUDGING_MODAL = '@@SET_SHOW_NUDGING_MODAL',
	SET_LAST_VIDEO_PLAYED_AT_ACTION = '@@SET_LAST_VIDEO_PLAYED_AT_ACTION',
	SET_HISTORY_LOCATIONS = '@@SET_HISTORY_LOCATIONS',
}

export interface SetShowNudgingModalAction extends Action {
	data: boolean;
}

export interface SetLastVideoPlayedAtAction extends Action {
	data: Date | null;
}

export interface SetHistoryLocationsAction extends Action {
	data: string[];
}

export interface UiState {
	readonly showNudgingModal: boolean | null;
	readonly lastVideoPlayedAt: Date | null;
	readonly historyLocations: string[];
}
