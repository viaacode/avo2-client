import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, FlexItem, Form, FormGroup, Select } from '@viaa/avo2-components';

import { ContentBlockForm, ContentBlockPreview } from '../../content-block/components';
import {
	CONTENT_BLOCK_CONFIG_MAP,
	CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import {
	ContentBlockComponentState,
	ContentBlockConfig,
	ContentBlockState,
	ContentBlockStateOptions,
	ContentBlockStateType,
	ContentBlockType,
} from '../../content-block/content-block.types';
import { Sidebar } from '../../shared/components';

interface ContentEditContentBlocksProps {
	contentBlockConfigs: ContentBlockConfig[];
	onAdd: (config: ContentBlockConfig) => void;
	onSave: (
		index: number,
		formGroupType: ContentBlockStateType,
		formGroupState: ContentBlockStateOptions,
		stateIndex?: number
	) => void;
	addComponentToState: (index: number, blockType: ContentBlockType) => void;
}

const ContentEditContentBlocks: FunctionComponent<ContentEditContentBlocksProps> = ({
	contentBlockConfigs,
	onAdd,
	onSave,
	addComponentToState,
}) => {
	// Hooks
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});

	const [t] = useTranslation();

	// Methods
	const getFormKey = (name: string, blockIndex: number, stateIndex: number = 0) =>
		`${name}-${blockIndex}-${stateIndex}`;

	const handleAddContentBlock = (configType: ContentBlockType) => {
		const newConfig = CONTENT_BLOCK_CONFIG_MAP[configType]();
		const contentBlockFormKey = getFormKey(newConfig.name, contentBlockConfigs.length);

		// Update content block configs
		onAdd(newConfig);

		// Set newly added config accordion as open
		setAccordionsOpenState({ [contentBlockFormKey]: true });
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
						onSave(index, formGroupType, input, stateIndex)
					}
					addComponentToState={() =>
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
					<FormGroup
						label={t(
							'admin/content/views/content-edit-content-blocks___voeg-een-content-block-toe'
						)}
					>
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
