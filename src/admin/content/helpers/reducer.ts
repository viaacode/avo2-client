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
			const { index, formGroupType, formGroupState, stateIndex } = action.payload;

			// Clone config
			const contentBlocks = [...state.contentBlockConfigs];

			// Create update object
			const stateToAdd: any = {
				[formGroupType]: formGroupState,
			};

			if (stateIndex || stateIndex === 0) {
				(contentBlocks[index].components.state as any)[stateIndex] = formGroupState;
			} else {
				// Convert update object to array if necessary
				const componentState = Array.isArray(formGroupState)
					? [...contentBlocks[index].components.state, ...stateToAdd.components]
					: {
							...contentBlocks[index].components.state,
							...(stateToAdd.components || {}),
					  };

				// Update single content block config
				const updatedConfig = {
					...contentBlocks[index],
					components: {
						state: componentState,
						fields: contentBlocks[index].components.fields,
					},
					block: {
						state: {
							...contentBlocks[index].block.state,
							...(stateToAdd.block || {}),
						},
						fields: contentBlocks[index].block.fields,
					},
				};

				// Apply update object to config
				contentBlocks.splice(index, 1, updatedConfig);
			}

			return {
				...state,
				contentBlockConfigs: contentBlocks,
			};
		},
	});
