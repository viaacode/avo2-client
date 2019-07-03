import { Avo } from '@viaa/avo2-types';
import { Action } from 'redux';

export enum DetailActionTypes {
	SET_DETAIL_LOADING = '@@detail/SET_DETAIL_LOADING',
	SET_DETAIL_SUCCESS = '@@detail/SET_DETAIL_SUCCESS',
	SET_DETAIL_ERROR = '@@detail/SET_DETAIL_ERROR',
}

export interface SetDetailSuccessAction extends Action {
	id: string;
	data: Avo.Detail.Response;
}

export interface SetDetailLoadingAction extends Action {
	id: string;
	loading: boolean;
}

export interface SetDetailErrorAction extends Action {
	id: string;
	error: boolean;
}

export type DetailAction = SetDetailSuccessAction | SetDetailLoadingAction | SetDetailErrorAction;

export interface DetailState {
	[id: string]: {
		readonly data: Avo.Detail.Response | null;
		readonly loading: boolean;
		readonly error: boolean;
	};
}
