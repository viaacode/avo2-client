import { createReducer } from '../../../shared/helpers';
import { ContentBlockConfig } from '../../content-block/content-block.types';

import { ContentEditAction, ContentEditActionType, ContentEditState } from '../content.types';

export const CONTENT_EDIT_INITIAL_STATE = (
	contentBlockConfigs: ContentBlockConfig[] = []
): ContentEditState => ({
	contentBlockConfigs,
});

export const contentEditReducer = (initialState: ContentEditState) =>
	createReducer(initialState, {
		[ContentEditActionType.ADD_CB_CONFIG]: (state, action: ContentEditAction) => ({
			...state,
			cbConfigs: [...state.contentBlockConfigs, action.payload],
		}),
		[ContentEditActionType.SET_CB_CONFIGS]: (state, action: ContentEditAction) => ({
			...state,
			cbConfigs: action.payload,
		}),
		[ContentEditActionType.ADD_COMPONENTS_STATE]: (state, action: ContentEditAction) => {
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
		[ContentEditActionType.SET_COMPONENTS_STATE]: (state, action: ContentEditAction) => {
			const { index, formGroupState, stateIndex } = action.payload;

			// Clone config
			const contentBlocks = [...state.contentBlockConfigs];

			if (stateIndex || stateIndex === 0) {
				(contentBlocks[index].components.state as any)[stateIndex] = formGroupState;
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
		[ContentEditActionType.SET_BLOCK_STATE]: (state, action: ContentEditAction) => {
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
