import { createReducer } from '../../../shared/helpers';
import { ContentBlockConfig } from '../../content-block/content-block.types';

import { ContentEditAction, ContentEditActionType, ContentEditState } from '../content.types';

export const CONTENT_EDIT_INITIAL_STATE = (
	cbConfigs: ContentBlockConfig[] = []
): ContentEditState => ({
	cbConfigs,
});

export const contentEditReducer = (initialState: ContentEditState) =>
	createReducer(initialState, {
		[ContentEditActionType.ADD_CB_CONFIG]: (state, action: ContentEditAction) => ({
			...state,
			cbConfigs: [...state.cbConfigs, action.payload],
		}),
		[ContentEditActionType.SET_CB_CONFIGS]: (state, action: ContentEditAction) => ({
			...state,
			cbConfigs: action.payload,
		}),
		[ContentEditActionType.UPDATE_FORM_STATE]: (state, action: ContentEditAction) => {
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
