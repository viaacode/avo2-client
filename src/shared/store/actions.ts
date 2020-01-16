import { Action, Dispatch } from 'redux';
import { GlobalActionTypes, SetIsModalOpenAction } from './types';

const setIsModalOpenAction = (isModalOpen: boolean) => {
	return async (dispatch: Dispatch): Promise<Action> => {
		return dispatch(setIsModalOpen(isModalOpen));
	};
};

const setIsModalOpen = (isModalOpen: boolean): SetIsModalOpenAction => ({
	isModalOpen,
	type: GlobalActionTypes.SET_IS_MODAL_OPEN,
});

export { setIsModalOpenAction };
