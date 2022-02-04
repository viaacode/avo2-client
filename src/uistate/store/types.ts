import { Action } from 'redux';

export enum UiStateActionTypes {
	SET_SHOW_NUDGING_MODAL = '@@search/SET_SHOW_NUDGING_MODAL',
}

export interface SetShowNudgingModalAction extends Action {
	data: boolean;
}

export interface UiState {
	readonly showNudgingModal: boolean | null;
}
