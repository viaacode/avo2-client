import produce, { Draft } from 'immer';

import {
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockErrors,
} from '../../../shared/types';
import { ContentEditAction, ContentEditActionType, ContentEditState } from '../../content.types';

type ReorderConfigPayload = { configIndex: number; indexUpdate: number };
type AddComponentStatePayload = { index: number; formGroupState: ContentBlockComponentState[] };
type RemoveComponentStatePayload = { index: number; stateIndex: number };
type SetComponentStatePayload = {
	index: number;
	formGroupState: ContentBlockComponentState;
	stateIndex: number;
};
type SetBlockStatePayload = { index: number; formGroupState: ContentBlockComponentState[] };
type SetConfigErrorPayload = { configIndex: number; errors: ContentBlockErrors };

export const CONTENT_EDIT_INITIAL_STATE = (
	contentBlockConfigs: ContentBlockConfig[] = []
): ContentEditState => ({
	contentBlockConfigs,
});

// Helpers
const repositionConfigs = (updatedConfigs: ContentBlockConfig[]) => {
	updatedConfigs.forEach((config, position) => {
		config.block.state.position = position;
	});
};

// Reducer
export const contentEditReducer = produce(
	(draft: Draft<ContentEditState>, { payload, type }: ContentEditAction) => {
		// Because we use immer, we have to mutate the draft state in place for it to work properly
		// We don't have to return anything because our produce() will automagically do that for us
		switch (type) {
			case ContentEditActionType.ADD_CONTENT_BLOCK_CONFIG:
				draft.contentBlockConfigs.push(payload as ContentBlockConfig);
				return;
			case ContentEditActionType.REMOVE_CONTENT_BLOCK_CONFIG:
				draft.contentBlockConfigs.splice(payload as number, 1);
				repositionConfigs(draft.contentBlockConfigs);
				return;
			case ContentEditActionType.REORDER_CONTENT_BLOCK_CONFIG: {
				const { configIndex, indexUpdate } = payload as ReorderConfigPayload;
				const newIndex = configIndex + indexUpdate;
				// Get updated item and remove it from copy
				const reorderedCOnfig = draft.contentBlockConfigs.splice(configIndex, 1)[0];
				// Apply update object to config
				draft.contentBlockConfigs.splice(newIndex, 0, reorderedCOnfig);
				// Reposition
				repositionConfigs(draft.contentBlockConfigs);
				return;
			}
			case ContentEditActionType.SET_CONTENT_BLOCK_CONFIGS:
				draft.contentBlockConfigs = payload as ContentBlockConfig[];
				return;
			case ContentEditActionType.ADD_COMPONENTS_STATE: {
				const { formGroupState, index } = payload as AddComponentStatePayload;
				const { components } = draft.contentBlockConfigs[index];
				components.state = [...components.state, ...formGroupState];
				return;
			}
			case ContentEditActionType.REMOVE_COMPONENTS_STATE: {
				const { index, stateIndex } = payload as RemoveComponentStatePayload;
				const { components } = draft.contentBlockConfigs[index];
				(components.state as ContentBlockComponentState[]).splice(stateIndex, 1);
				return;
			}
			case ContentEditActionType.SET_COMPONENTS_STATE: {
				const { formGroupState, index, stateIndex } = payload as SetComponentStatePayload;
				const { components } = draft.contentBlockConfigs[index];

				if (stateIndex || stateIndex === 0) {
					// Config component state is an array (repeatable)
					const repeatableState = components.state as ContentBlockComponentState[];
					repeatableState[stateIndex] = {
						...repeatableState[stateIndex],
						...formGroupState,
					};
				} else {
					// Config component state is a single object (non-repeatable)
					components.state = {
						...components.state,
						...formGroupState,
					};
				}
				return;
			}
			case ContentEditActionType.SET_BLOCK_STATE: {
				const { formGroupState, index } = payload as SetBlockStatePayload;
				const { block } = draft.contentBlockConfigs[index];
				block.state = { ...block.state, ...formGroupState };
				return;
			}
			case ContentEditActionType.SET_CONTENT_BLOCK_ERROR: {
				const { configIndex, errors } = payload as SetConfigErrorPayload;
				draft.contentBlockConfigs[configIndex].errors = errors;
				return;
			}
			default:
				// We don't actually need the default case, produce() will simply return the
				// original state if nothing has changed in the draft
				return;
		}
	}
);
