import { Action } from 'redux';

export enum GlobalActionTypes {
	SET_IS_MODAL_OPEN = '@@global/SET_IS_MODAL_OPEN',
}

export interface SetIsModalOpenAction extends Action {
	isModalOpen: boolean;
}

export interface GlobalState {
	readonly isModalOpen: boolean;
}
