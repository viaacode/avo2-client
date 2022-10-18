import { Avo } from '@viaa/avo2-types';
import { Action } from 'redux';

export enum SearchActionTypes {
	SET_RESULTS_LOADING = '@@search/SET_RESULTS_LOADING',
	SET_RESULTS_SUCCESS = '@@search/SET_RESULTS_SUCCESS',
	SET_RESULTS_ERROR = '@@search/SET_RESULTS_ERROR',
}

export interface SetSearchResultsSuccessAction extends Action {
	data: Avo.Search.Search;
}

export interface SetSearchResultsLoadingAction extends Action {
	loading: boolean;
}

export interface SetSearchResultsErrorAction extends Action {
	error: boolean;
}

export type SearchAction =
	| SetSearchResultsSuccessAction
	| SetSearchResultsLoadingAction
	| SetSearchResultsErrorAction;

export interface SearchState {
	readonly data: Avo.Search.Search | null;
	readonly loading: boolean;
	readonly error: boolean;
}
