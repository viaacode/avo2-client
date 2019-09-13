import { Action } from 'redux';

export enum PlayerTokenActionTypes {
	SET_PLAYER_TOKEN_LOADING = '@@player/SET_PLAYER_TOKEN_LOADING',
	SET_PLAYER_TOKEN_SUCCESS = '@@player/SET_PLAYER_TOKEN_SUCCESS',
	SET_PLAYER_TOKEN_ERROR = '@@player/SET_PLAYER_TOKEN_ERROR',
}

export type PlayerTokenResponse = {
	url: string;
};

export interface SetPlayerTokenSuccessAction extends Action {
	data: PlayerTokenResponse;
}

export interface SetPlayerTokenLoadingAction extends Action {
	loading: boolean;
}

export interface SetPlayerTokenErrorAction extends Action {
	error: boolean;
}
export type PlayerTokenAction =
	| SetPlayerTokenSuccessAction
	| SetPlayerTokenLoadingAction
	| SetPlayerTokenErrorAction;

export interface PlayerTokenState {
	readonly data: PlayerTokenResponse | null; // TODO move to types: Avo.Authentication.Response
	readonly loading: boolean;
	readonly error: boolean;
}
