import { Avo } from '@viaa/avo2-types';
import { Action } from 'redux';

export enum ItemActionTypes {
	SET_ITEM_LOADING = '@@item/SET_ITEM_LOADING',
	SET_ITEM_SUCCESS = '@@item/SET_ITEM_SUCCESS',
	SET_ITEM_ERROR = '@@item/SET_ITEM_ERROR',
}

export interface SetItemSuccessAction extends Action {
	id: string;
	data: Avo.Item.Response;
}

export interface SetItemLoadingAction extends Action {
	id: string;
	loading: boolean;
}

export interface SetItemErrorAction extends Action {
	id: string;
	error: boolean;
}

export type ItemAction = SetItemSuccessAction | SetItemLoadingAction | SetItemErrorAction;

export interface ItemState {
	[id: string]: {
		readonly data: Avo.Item.Response | null;
		readonly loading: boolean;
		readonly error: boolean;
	};
}
