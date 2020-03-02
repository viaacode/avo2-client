import { ContentBlockComponentState, ContentBlockConfig } from '../../../shared/types';

import { ContentEditAction, ContentEditActionType, ContentEditState } from '../../content.types';

export const CONTENT_EDIT_INITIAL_STATE = (
	contentBlockConfigs: ContentBlockConfig[] = []
): ContentEditState => ({
	contentBlockConfigs,
});

// Helpers
const repositionConfigs = (updatedConfigs: ContentBlockConfig[]) => {
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

const removeConfig = (
	configs: ContentBlockConfig[],
	indexToRemove: number
): ContentBlockConfig[] => {
	// Remove item from array
	configs.splice(indexToRemove, 1);
	// Update position properties with new index
	return repositionConfigs(configs);
};

const reorderConfigs = (
	configs: ContentBlockConfig[],
	{ configIndex, indexUpdate }: { configIndex: number; indexUpdate: number }
): ContentBlockConfig[] => {
	const newIndex = configIndex + indexUpdate;
	// Get updated item and remove it from copy
	const updatedConfig = configs.splice(configIndex, 1)[0];
	// Add item back at new index
	configs.splice(newIndex, 0, updatedConfig);

	return repositionConfigs(configs);
};

const addComponentState = (
	configs: ContentBlockConfig[],
	{ index, formGroupState }: { index: number; formGroupState: ContentBlockComponentState[] }
): ContentBlockConfig[] => {
	// Convert update object to array if necessary
	const componentState = [...configs[index].components.state, ...formGroupState];
	// Update single content block config
	const updatedConfig = {
		...configs[index],
		components: {
			...configs[index].components,
			state: componentState,
		},
	};
	// Apply update object to config
	configs.splice(index, 1, updatedConfig);

	return configs;
};

const removeComponentState = (
	configs: ContentBlockConfig[],
	{ index, stateIndex }: { index: number; stateIndex: number }
): ContentBlockConfig[] => {
	(configs[index].components.state as ContentBlockComponentState[]).splice(stateIndex, 1);

	return configs;
};

const setComponentState = (
	configs: ContentBlockConfig[],
	payload: { index: number; formGroupState: ContentBlockComponentState; stateIndex: number }
): ContentBlockConfig[] => {
	const { index, formGroupState, stateIndex } = payload;
	if (stateIndex || stateIndex === 0) {
		const componentState: ContentBlockComponentState[] = configs[index].components
			.state as ContentBlockComponentState[];
		(configs[index].components.state as ContentBlockComponentState[])[stateIndex] = {
			...componentState[stateIndex],
			...formGroupState,
		};
	} else {
		// Convert update object to array if necessary
		const componentState = Array.isArray(configs[index].components.state)
			? [...configs[index].components.state, formGroupState]
			: {
					...configs[index].components.state,
					...formGroupState,
			  };

		// Update single content block config
		const updatedConfig: ContentBlockConfig = {
			...configs[index],
			components: {
				...configs[index].components,
				// Different blocks can have the same property with different types, typescript doesn't like this
				// Example:
				// ImageBlock.width => multi option
				// ImageGridBlock.width => number
				state: componentState as any,
				fields: configs[index].components.fields,
			},
		};

		// Apply update object to config
		configs.splice(index, 1, updatedConfig);
	}

	return configs;
};

const setBlockState = (
	configs: ContentBlockConfig[],
	{ index, formGroupState }: { index: number; formGroupState: ContentBlockComponentState[] }
): ContentBlockConfig[] => {
	// Update single content block config
	const block = configs[index].block;
	const updatedConfig = {
		...configs[index],
		block: {
			...block,
			state: {
				...block.state,
				...formGroupState,
			},
			fields: block.fields,
		},
	};
	// Apply update object to config
	configs.splice(index, 1, updatedConfig);

	return configs;
};

// Reducer
export const contentEditReducer = (
	state: ContentEditState,
	{ payload, type }: ContentEditAction
) => {
	const { contentBlockConfigs } = state;

	switch (type) {
		case ContentEditActionType.ADD_CONTENT_BLOCK_CONFIG:
			return { contentBlockConfigs: [...contentBlockConfigs, payload] };
		case ContentEditActionType.REMOVE_CONTENT_BLOCK_CONFIG:
			return { contentBlockConfigs: removeConfig([...contentBlockConfigs], payload) };
		case ContentEditActionType.REORDER_CONTENT_BLOCK_CONFIG:
			return { contentBlockConfigs: reorderConfigs([...contentBlockConfigs], payload) };
		case ContentEditActionType.SET_CONTENT_BLOCK_CONFIGS:
			return { contentBlockConfigs: payload };
		case ContentEditActionType.ADD_COMPONENTS_STATE:
			return { contentBlockConfigs: addComponentState([...contentBlockConfigs], payload) };
		case ContentEditActionType.REMOVE_COMPONENTS_STATE:
			return { contentBlockConfigs: removeComponentState([...contentBlockConfigs], payload) };
		case ContentEditActionType.SET_COMPONENTS_STATE:
			return { contentBlockConfigs: setComponentState([...contentBlockConfigs], payload) };
		case ContentEditActionType.SET_BLOCK_STATE:
			return { contentBlockConfigs: setBlockState([...contentBlockConfigs], payload) };

		default:
			return state;
	}
};
