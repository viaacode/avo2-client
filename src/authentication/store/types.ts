import { Action } from 'redux';

export interface CheckLoginStateResponse {
	message: 'LOGGED_IN' | 'LOGGED_OUT';
}

export enum CheckLoginStateActionTypes {
	SET_CHECK_LOGIN_STATE_LOADING = '@@checkLoginState/SET_CHECK_LOGIN_STATE_LOADING',
	SET_CHECK_LOGIN_STATE_SUCCESS = '@@checkLoginState/SET_CHECK_LOGIN_STATE_SUCCESS',
	SET_CHECK_LOGIN_STATE_ERROR = '@@checkLoginState/SET_CHECK_LOGIN_STATE_ERROR',
}

export interface SetCheckLoginStateSuccessAction extends Action {
	data: CheckLoginStateResponse;
}

export interface SetCheckLoginStateLoadingAction extends Action {
	loading: boolean;
}

export interface SetCheckLoginStateErrorAction extends Action {
	error: boolean;
}

export type CheckLoginStateAction =
	| SetCheckLoginStateSuccessAction
	| SetCheckLoginStateLoadingAction
	| SetCheckLoginStateErrorAction;

export interface CheckLoginState {
	readonly data: CheckLoginStateResponse | null; // TODO move to types: Avo.Authentication.Response
	readonly loading: boolean;
	readonly error: boolean;
}
