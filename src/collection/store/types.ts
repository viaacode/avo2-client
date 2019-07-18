import { Avo } from '@viaa/avo2-types';
import { Action } from 'redux';

export enum CollectionActionTypes {
	SET_COLLECTION_LOADING = '@@collection/SET_COLLECTION_LOADING',
	SET_COLLECTION_SUCCESS = '@@collection/SET_COLLECTION_SUCCESS',
	SET_COLLECTION_ERROR = '@@collection/SET_COLLECTION_ERROR',
}

export interface SetCollectionSuccessAction extends Action {
	id: string;
	data: Avo.Collection.Response;
}

export interface SetCollectionLoadingAction extends Action {
	id: string;
	loading: boolean;
}

export interface SetCollectionErrorAction extends Action {
	id: string;
	error: boolean;
}

export type CollectionAction =
	| SetCollectionSuccessAction
	| SetCollectionLoadingAction
	| SetCollectionErrorAction;

export interface CollectionState {
	[id: string]: {
		readonly data: Avo.Collection.Response | null;
		readonly loading: boolean;
		readonly error: boolean;
	};
}
