import { Action } from 'redux';

export enum UiStateActionTypes {
	SET_SHOW_NUDGING_MODAL = '@@SET_SHOW_NUDGING_MODAL',
	SET_LAST_VIDEO_PLAYED_AT_ACTION = '@@SET_LAST_VIDEO_PLAYED_AT_ACTION',
}

export interface SetShowNudgingModalAction extends Action {
	data: boolean;
}

export interface SetLastVideoPlayedAtAction extends Action {
	data: Date | null;
}

export interface UiState {
	readonly showNudgingModal: boolean | null;
	readonly lastVideoPlayedAt: Date | null;
}
