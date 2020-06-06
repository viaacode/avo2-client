import produce, { Draft } from 'immer';
import { cloneDeep, isNil } from 'lodash-es';
import moment from 'moment';

import { ValueOf } from '../../../../shared/types';
import {
	ContentBlockComponentsConfig,
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockErrors,
	RepeatedContentBlockComponentState,
	SingleContentBlockComponentState,
} from '../../../shared/types';
import { ContentEditActionType, ContentPageInfo, ContentWidth } from '../../content.types';

interface SetContentPage {
	type: ContentEditActionType.SET_CONTENT_PAGE;
	payload: {
		contentPageInfo: ContentPageInfo;
		replaceInitial: boolean;
	};
}

interface SetContentPageProp {
	type: ContentEditActionType.SET_CONTENT_PAGE_PROP;
	payload: {
		propName: keyof ContentPageInfo;
		propValue: ValueOf<ContentPageInfo>;
	};
}

interface AddContentBlockConfig {
	type: ContentEditActionType.ADD_CONTENT_BLOCK_CONFIG;
	payload: ContentBlockConfig;
}

interface RemoveContentBlockConfig {
	type: ContentEditActionType.REMOVE_CONTENT_BLOCK_CONFIG;
	payload: number;
}

interface ReorderContentBlockConfig {
	type: ContentEditActionType.REORDER_CONTENT_BLOCK_CONFIG;
	payload: { configIndex: number; indexUpdate: number };
}

interface AddComponentsState {
	type: ContentEditActionType.ADD_COMPONENTS_STATE;
	payload: {
		index: number;
		formGroupState: ContentBlockComponentState;
	};
}

interface SetComponentsState {
	type: ContentEditActionType.SET_COMPONENTS_STATE;
	payload: {
		index: number;
		formGroupState: SingleContentBlockComponentState | RepeatedContentBlockComponentState;
		stateIndex?: number;
	};
}

interface RemoveComponentsState {
	type: ContentEditActionType.REMOVE_COMPONENTS_STATE;
	payload: {
		index: number;
		stateIndex: number;
	};
}

interface SetBlockState {
	type: ContentEditActionType.SET_BLOCK_STATE;
	payload: {
		index: number;
		formGroupState: ContentBlockComponentState;
	};
}

interface SetContentBlockError {
	type: ContentEditActionType.SET_CONTENT_BLOCK_ERROR;
	payload: {
		configIndex: number;
		errors: ContentBlockErrors;
	};
}

export type ContentEditAction =
	| SetContentPage
	| SetContentPageProp
	| AddContentBlockConfig
	| RemoveContentBlockConfig
	| ReorderContentBlockConfig
	| AddComponentsState
	| SetComponentsState
	| RemoveComponentsState
	| SetBlockState
	| SetContentBlockError;

export interface ContentPageEditState {
	currentContentPageInfo: ContentPageInfo;
	initialContentPageInfo: ContentPageInfo;
}

export const CONTENT_PAGE_INITIAL_STATE = (): ContentPageInfo => {
	return ({
		thumbnail_path: null,
		title: '',
		description_html: '',
		description_state: undefined,
		seo_description: '',
		is_protected: false,
		path: '',
		content_type: 'PAGINA',
		content_width: ContentWidth.REGULAR,
		publish_at: '',
		depublish_at: '',
		is_public: false,
		created_at: moment().toISOString(),
		updated_at: moment().toISOString(),
		published_at: null,
		user_profile_id: null,
		user_group_ids: [],
		labels: [],
		contentBlockConfigs: [],
	} as unknown) as ContentPageInfo;
};

// Helpers
const repositionConfigs = (updatedConfigs: ContentBlockConfig[]) => {
	updatedConfigs.forEach((config, position) => {
		config.position = position;
	});
};

// Reducer
export const contentEditReducer = produce(
	(draft: Draft<ContentPageEditState>, action: ContentEditAction) => {
		// Because we use immer, we have to mutate the draft state in place for it to work properly
		// We don't have to return anything because our produce() will automagically do that for us
		let config: ContentBlockConfig;
		let components: ContentBlockComponentsConfig;
		let componentsState: ContentBlockComponentState;
		switch (action.type) {
			case ContentEditActionType.SET_CONTENT_PAGE:
				draft.currentContentPageInfo = action.payload.contentPageInfo;
				if (action.payload.replaceInitial) {
					draft.initialContentPageInfo = cloneDeep(action.payload.contentPageInfo);
				}
				return;

			case ContentEditActionType.SET_CONTENT_PAGE_PROP:
				(draft.currentContentPageInfo as any)[action.payload.propName] =
					action.payload.propValue;
				return;

			case ContentEditActionType.ADD_CONTENT_BLOCK_CONFIG:
				draft.currentContentPageInfo.contentBlockConfigs.push(
					action.payload as ContentBlockConfig
				);
				return;

			case ContentEditActionType.REMOVE_CONTENT_BLOCK_CONFIG:
				draft.currentContentPageInfo.contentBlockConfigs.splice(
					action.payload as number,
					1
				);
				repositionConfigs(draft.currentContentPageInfo.contentBlockConfigs);
				return;

			case ContentEditActionType.REORDER_CONTENT_BLOCK_CONFIG:
				const reorderContentBlockConfig = action as ReorderContentBlockConfig;
				const newIndex =
					reorderContentBlockConfig.payload.configIndex +
					reorderContentBlockConfig.payload.indexUpdate;
				// Get updated item and remove it from copy
				const reorderedConfig = draft.currentContentPageInfo.contentBlockConfigs.splice(
					reorderContentBlockConfig.payload.configIndex,
					1
				)[0];
				// Apply update object to config
				draft.currentContentPageInfo.contentBlockConfigs.splice(
					newIndex,
					0,
					reorderedConfig
				);
				// Reposition
				repositionConfigs(draft.currentContentPageInfo.contentBlockConfigs);
				return;

			case ContentEditActionType.ADD_COMPONENTS_STATE:
				const addComponentsState = action as AddComponentsState;
				config =
					draft.currentContentPageInfo.contentBlockConfigs[
						addComponentsState.payload.index
					];
				componentsState = config.components.state;
				(componentsState as RepeatedContentBlockComponentState[]).push(
					...addComponentsState.payload.formGroupState
				);
				return;

			case ContentEditActionType.REMOVE_COMPONENTS_STATE:
				const removeComponentsState = action as RemoveComponentsState;
				config =
					draft.currentContentPageInfo.contentBlockConfigs[
						removeComponentsState.payload.index
					];
				componentsState = config.components.state;
				(componentsState as RepeatedContentBlockComponentState[]).splice(
					removeComponentsState.payload.stateIndex,
					1
				);
				return;

			case ContentEditActionType.SET_COMPONENTS_STATE:
				const setComponentsState = action as SetComponentsState;
				config =
					draft.currentContentPageInfo.contentBlockConfigs[
						setComponentsState.payload.index
					];
				components = config.components as ContentBlockComponentsConfig;

				if (!isNil(action.payload.stateIndex)) {
					// Config component state is an array (repeatable)
					const repeatableState = components.state as RepeatedContentBlockComponentState[];
					repeatableState[action.payload.stateIndex] = {
						...repeatableState[action.payload.stateIndex],
						...(action.payload.formGroupState as RepeatedContentBlockComponentState),
					};
				} else {
					// Config component state is a single object (single)
					components.state = {
						...components.state,
						...(action.payload.formGroupState as SingleContentBlockComponentState),
					};
				}
				return;

			case ContentEditActionType.SET_BLOCK_STATE:
				const setBlockState = action as SetBlockState;
				const { block } = draft.currentContentPageInfo.contentBlockConfigs[
					setBlockState.payload.index
				];
				block.state = { ...block.state, ...setBlockState.payload.formGroupState };
				return;

			case ContentEditActionType.SET_CONTENT_BLOCK_ERROR:
				const setContentBlockError = action as SetContentBlockError;
				draft.currentContentPageInfo.contentBlockConfigs[
					setContentBlockError.payload.configIndex
				].errors = setContentBlockError.payload.errors;
				return;

			default:
				// We don't actually need the default case, produce() will simply return the
				// original state if nothing has changed in the draft
				return;
		}
	}
);
