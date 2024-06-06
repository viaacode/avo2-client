import { type Avo } from '@viaa/avo2-types';
import { type Action } from 'redux';

export enum SearchActionTypes {
	SET_RESULTS_LOADING = '@@search/SET_RESULTS_LOADING',
	SET_RESULTS_SUCCESS = '@@search/SET_RESULTS_SUCCESS',
	SET_RESULTS_ERROR = '@@search/SET_RESULTS_ERROR',
	SET_RESULTS_CONTROLLER = '@@search/SET_RESULTS_CONTROLLER',
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

export interface SetSearchResultsControllerAction extends Action {
	controller: AbortController;
}

export interface SearchState {
	readonly data: Avo.Search.Search | null;
	readonly loading: boolean;
	readonly error: boolean;
	readonly controller: AbortController | null;
}
