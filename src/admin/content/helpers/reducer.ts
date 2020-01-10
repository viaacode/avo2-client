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
		[ContentEditBlocksActionType.ADD_COMPONENTS_STATE]: (
			state,
			action: ContentEditBlocksAction
		) => {
			const { index, formGroupState } = action.payload;

			// Clone config
			const contentBlocks = [...state.contentBlockConfigs];

			// Convert update object to array if necessary
			const componentState = [...contentBlocks[index].components.state, formGroupState];

			// Update single content block config
			const updatedConfig = {
				...contentBlocks[index],
				components: {
					...contentBlocks[index].components,
					state: componentState,
				},
			};

			// Apply update object to config
			contentBlocks.splice(index, 1, updatedConfig);

			return {
				...state,
				contentBlockConfigs: contentBlocks,
			};
		},
		[ContentEditBlocksActionType.SET_COMPONENTS_STATE]: (
			state,
			action: ContentEditBlocksAction
		) => {
			const { index, formGroupState, stateIndex } = action.payload;

			// Clone config
			const contentBlocks = [...state.contentBlockConfigs];

			if (stateIndex || stateIndex === 0) {
				(contentBlocks[index].components.state as any)[stateIndex] = {
					...(contentBlocks[index].components.state as any)[stateIndex],
					...formGroupState,
				};
			} else {
				// Convert update object to array if necessary
				const componentState = Array.isArray(contentBlocks[index].components.state)
					? [...contentBlocks[index].components.state, formGroupState]
					: {
							...contentBlocks[index].components.state,
							...formGroupState,
					  };

				// Update single content block config
				const updatedConfig = {
					...contentBlocks[index],
					components: {
						...contentBlocks[index].components,
						state: componentState,
						fields: contentBlocks[index].components.fields,
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
		[ContentEditBlocksActionType.SET_BLOCK_STATE]: (state, action: ContentEditBlocksAction) => {
			const { index, formGroupState } = action.payload;

			// Clone config
			const contentBlocks = [...state.contentBlockConfigs];

			// Update single content block config
			const updatedConfig = {
				...contentBlocks[index],
				block: {
					...contentBlocks[index].block,
					state: {
						...contentBlocks[index].block.state,
						...formGroupState,
					},
					fields: contentBlocks[index].block.fields,
				},
			};

			// Apply update object to config
			contentBlocks.splice(index, 1, updatedConfig);

			return {
				...state,
				contentBlockConfigs: contentBlocks,
			};
		},
	});
