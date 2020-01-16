import { createReducer } from '../../../shared/helpers';
import { ContentBlockConfig } from '../../content-block/content-block.types';

import { ContentEditAction, ContentEditActionType, ContentEditState } from '../content.types';

export const CONTENT_EDIT_INITIAL_STATE = (
	contentBlockConfigs: ContentBlockConfig[] = []
): ContentEditState => ({
	contentBlockConfigs,
});

const repositionContentBlockConfigs = (updatedConfigs: ContentBlockConfig[]) => {
	return updatedConfigs.map((config, position) => ({
		...config,
		block: {
			...config.block,
			state: {
				...config.block.state,
				position,
			},
		},
	}));
};

export const contentEditReducer = (initialState: ContentEditState) =>
	createReducer<ContentEditState>(initialState, {
		[ContentEditActionType.ADD_CONTENT_BLOCK_CONFIG]: (state, action: ContentEditAction) => ({
			...state,
			contentBlockConfigs: [...state.contentBlockConfigs, action.payload],
		}),
		[ContentEditActionType.REMOVE_CONTENT_BLOCK_CONFIG]: (state, action: ContentEditAction) => {
			// Clone config
			const clonedConfigs = [...state.contentBlockConfigs];
			// Remove item from array
			clonedConfigs.splice(action.payload, 1);
			// Update position properties with new index
			const repositionedConfigs = repositionContentBlockConfigs(clonedConfigs);

			return {
				...state,
				contentBlockConfigs: repositionedConfigs,
			};
		},
		[ContentEditActionType.REORDER_CONTENT_BLOCK_CONFIG]: (state, action: ContentEditAction) => {
			const { configIndex, indexUpdate } = action.payload;
			const newIndex = configIndex + indexUpdate;

			// Clone config
			const clonedConfigs = [...state.contentBlockConfigs];
			// Get updated item and remove it from copy
			const updatedConfig = clonedConfigs.splice(configIndex, 1)[0];
			// Add item back at new index
			clonedConfigs.splice(newIndex, 0, updatedConfig);
			// Update position properties with new index
			const repositionedConfigs = repositionContentBlockConfigs(clonedConfigs);

			return {
				...state,
				contentBlockConfigs: repositionedConfigs,
			};
		},
		[ContentEditActionType.SET_CONTENT_BLOCK_CONFIGS]: (state, action: ContentEditAction) => ({
			...state,
			contentBlockConfigs: action.payload,
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
		[ContentEditActionType.REMOVE_COMPONENTS_STATE]: (state, action: ContentEditAction) => {
			const { index, stateIndex } = action.payload;

			const contentBlocks = [...state.contentBlockConfigs];

			(contentBlocks[index].components.state as any).splice(stateIndex, 1);

			return {
				state,
				contentBlockConfigs: contentBlocks,
			};
		},
		[ContentEditActionType.SET_COMPONENTS_STATE]: (state, action: ContentEditAction) => {
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
