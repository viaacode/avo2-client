import { Action } from 'redux';

export interface LoginResponse {
	message: 'LOGGED_IN' | 'LOGGED_OUT';
}

export enum LoginActionTypes {
	SET_LOGIN_LOADING = '@@login/SET_LOGIN_LOADING',
	SET_LOGIN_SUCCESS = '@@login/SET_LOGIN_SUCCESS',
	SET_LOGIN_ERROR = '@@login/SET_LOGIN_ERROR',
}

export interface SetLoginSuccessAction extends Action {
	data: LoginResponse;
}

export interface SetLoginLoadingAction extends Action {
	loading: boolean;
}

export interface SetLoginErrorAction extends Action {
	error: boolean;
}

export type LoginAction = SetLoginSuccessAction | SetLoginLoadingAction | SetLoginErrorAction;

export interface LoginState {
	readonly data: LoginResponse | null; // TODO move to types: Avo.Authentication.Response
	readonly loading: boolean;
	readonly error: boolean;
}
