import { createReducer } from '../../../shared/helpers';

import {
	ContentEditBlocksAction,
	ContentEditBlocksActionType,
	ContentEditBlocksState,
} from '../content.types';

export const CONTENT_EDIT_BLOCKS_INITIAL_STATE = (): ContentEditBlocksState => ({
	cbConfigs: [],
});

export const contentEditBlocksReducer = (initialState: ContentEditBlocksState) =>
	createReducer(initialState, {
		[ContentEditBlocksActionType.ADD_CB_CONFIG]: (state, action: ContentEditBlocksAction) => ({
			...state,
			cbConfigs: [...state.cbConfigs, action.payload],
		}),
		[ContentEditBlocksActionType.SET_FORM_STATE]: (state, action: ContentEditBlocksAction) => {
			const { index, formState } = action.payload;
			// Clone content block states array to prevent mutating state in place
			const cbConfigsCopy = [...state.cbConfigs];
			// Update item with new initialState
			const updatedCbConfig = {
				...cbConfigsCopy[index],
				formState: {
					...cbConfigsCopy[index].formState,
					...formState,
				},
			};

			// Update item at given index
			cbConfigsCopy.splice(index, 1, updatedCbConfig);

			return {
				...state,
				cbConfigs: cbConfigsCopy,
			};
		},
	});
