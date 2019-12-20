import { createReducer } from '../../../shared/helpers';

import {
	ContentEditBlocksAction,
	ContentEditBlocksActionType,
	ContentEditBlocksState,
} from '../content.types';

export const CONTENT_EDIT_BLOCKS_INITIAL_STATE = (): ContentEditBlocksState => ({
	contentBlockConfigs: [],
});

export const contentEditBlocksReducer = (initialState: ContentEditBlocksState) =>
	createReducer(initialState, {
		[ContentEditBlocksActionType.ADD_CB_CONFIG]: (state, action: ContentEditBlocksAction) => ({
			...state,
			contentBlockConfigs: [...state.contentBlockConfigs, action.payload],
		}),
		[ContentEditBlocksActionType.SET_FORM_STATE]: (state, action: ContentEditBlocksAction) => {
			const { index, formState } = action.payload;
			// Clone content block states array to prevent mutating state in place
			const contentBlockConfigsCopy = [...state.contentBlockConfigs];
			// Update item with new initialState
			const updatedCbConfig = {
				...contentBlockConfigsCopy[index],
				formState: {
					...contentBlockConfigsCopy[index].formState,
					...formState,
				},
			};

			// Update item at given index
			contentBlockConfigsCopy.splice(index, 1, updatedCbConfig);

			return {
				...state,
				contentBlockConfigs: contentBlockConfigsCopy,
			};
		},
	});
