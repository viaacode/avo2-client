import React, { FunctionComponent, useReducer, useState } from 'react';

import { Flex, FlexItem, Form, FormGroup, Select } from '@viaa/avo2-components';

import { ContentBlockForm, ContentBlockPreview } from '../../content-block/components';
import {
	CONTENT_BLOCK_CONFIG_MAP,
	CONTENT_BLOCK_INITIAL_STATE_MAP,
	CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import {
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockStateOptions,
	ContentBlockStateType,
	ContentBlockType,
} from '../../content-block/content-block.types';
import { Sidebar } from '../../shared/components';

import { ContentEditBlocksActionType } from '../content.types';
import { CONTENT_EDIT_BLOCKS_INITIAL_STATE, contentEditBlocksReducer } from '../helpers/reducer';

const ContentEditContentBlocks: FunctionComponent = () => {
	const initialState = CONTENT_EDIT_BLOCKS_INITIAL_STATE();

	// Hooks
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});
	const [{ contentBlockConfigs }, dispatch] = useReducer(
		contentEditBlocksReducer(initialState),
		initialState
	);

	// Methods
	const getFormKey = (name: string, blockIndex: number, stateIndex: number = 0) =>
		`${name}-${blockIndex}-${stateIndex}`;

	const handleAddContentBlock = (configType: ContentBlockType) => {
		const newConfig = CONTENT_BLOCK_CONFIG_MAP[configType]();
		const contentBlockFormKey = getFormKey(newConfig.name, contentBlockConfigs.length);

		// Update content block configs
		dispatch({
			type: ContentEditBlocksActionType.ADD_CB_CONFIG,
			payload: newConfig,
		});

		// Set newly added config accordion as open
		setAccordionsOpenState({ [contentBlockFormKey]: true });
	};

	const addComponentToState = (index: number, blockType: ContentBlockType) => {
		dispatch({
			type: ContentEditBlocksActionType.SET_FORM_STATE,
			payload: {
				index,
				formGroupType: 'components',
				formGroupState: [CONTENT_BLOCK_INITIAL_STATE_MAP[blockType]],
			},
		});
	};

	const handleSave = (
		index: number,
		formGroupType: ContentBlockStateType,
		formGroupState: ContentBlockStateOptions,
		stateIndex?: number
	) => {
		dispatch({
			type: ContentEditBlocksActionType.SET_FORM_STATE,
			payload: { index, formGroupType, formGroupState, stateIndex },
		});
	};

	// Render
	const renderContentBlockForms = () =>
		contentBlockConfigs.map((contentBlockConfig, index) => {
			const contentBlockFormKey = getFormKey(contentBlockConfig.name, index);

			return (
				<ContentBlockForm
					key={contentBlockFormKey}
					config={contentBlockConfig}
					index={index + 1}
					isAccordionOpen={accordionsOpenState[contentBlockFormKey] || false}
					length={contentBlockConfigs.length}
					setIsAccordionOpen={() =>
						setAccordionsOpenState({
							[contentBlockFormKey]: !accordionsOpenState[contentBlockFormKey],
						})
					}
					onChange={(formGroupType: ContentBlockStateType, input: any, stateIndex?: number) =>
						handleSave(index, formGroupType, input, stateIndex)
					}
					addComponentState={() =>
						addComponentToState(index, contentBlockConfig.block.state.blockType)
					}
				/>
			);
		});

	const renderBlockPreview = (
		formGroupState: ContentBlockComponentState,
		blockState: ContentBlockState,
		blockIndex: number,
		stateIndex?: number
	) => (
		<ContentBlockPreview
			key={getFormKey(blockState.blockType, blockIndex, stateIndex)}
			componentState={formGroupState}
			blockState={blockState}
		/>
	);

	const renderBlockPreviews = () =>
		contentBlockConfigs.map((contentBlockConfig, blockIndex) => {
			const { components, block } = contentBlockConfig;

			return Array.isArray(components.state)
				? components.state.map((formGroupState, stateIndex) =>
						renderBlockPreview(formGroupState, block.state, blockIndex, stateIndex)
				  )
				: renderBlockPreview(components.state, block.state, blockIndex);
		});

	return (
		<Flex className="c-content-edit-view__content">
			<FlexItem>{renderBlockPreviews()}</FlexItem>
			<Sidebar className="c-content-edit-view__sidebar" light>
				{renderContentBlockForms()}
				<Form>
					<FormGroup label="Voeg een content block toe">
						<Select
							options={CONTENT_BLOCK_TYPE_OPTIONS}
							onChange={value => handleAddContentBlock(value as ContentBlockType)}
							value={CONTENT_BLOCK_TYPE_OPTIONS[0].value}
						/>
					</FormGroup>
				</Form>
			</Sidebar>
		</Flex>
	);
};

export default ContentEditContentBlocks;
