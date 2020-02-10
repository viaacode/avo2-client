import React, { FunctionComponent, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Flex, FlexItem, Form, FormGroup, Select } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { DefaultSecureRouteProps } from '../../../authentication/components/SecuredRoute';
import { ContentBlockForm, ContentBlockPreview } from '../../content-block/components';
import {
	CONTENT_BLOCK_CONFIG_MAP,
	CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import {
	ContentBlockConfig,
	ContentBlockStateOptions,
	ContentBlockStateType,
	ContentBlockType,
} from '../../content-block/content-block.types';
import { Sidebar } from '../../shared/components';
import { createKey } from '../../shared/helpers/create-key';

interface ContentEditContentBlocksProps extends DefaultSecureRouteProps {
	contentBlockConfigs: ContentBlockConfig[];
	contentWidth: Avo.Content.ContentWidth;
	onAdd: (config: ContentBlockConfig) => void;
	onRemove: (configIndex: number) => void;
	onReorder: (configIndex: number, indexUpdate: number) => void;
	onSave: (
		index: number,
		formGroupType: ContentBlockStateType,
		formGroupState: ContentBlockStateOptions,
		stateIndex?: number
	) => void;
	addComponentToState: (index: number, blockType: ContentBlockType) => void;
	removeComponentFromState: (index: number, stateIndex: number) => void;
}

const ContentEditContentBlocks: FunctionComponent<ContentEditContentBlocksProps> = ({
	contentBlockConfigs,
	contentWidth,
	onAdd,
	onRemove,
	onReorder,
	onSave,
	addComponentToState,
	removeComponentFromState,
	history,
	location,
	match,
	user,
}) => {
	// Hooks
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});

	const [t] = useTranslation();

	// Methods
	const getFormKey = (name: string, blockIndex: number, stateIndex: number = 0) =>
		`${name}-${blockIndex}-${stateIndex}`;

	const handleAddContentBlock = (configType: ContentBlockType) => {
		const newConfig = CONTENT_BLOCK_CONFIG_MAP[configType](contentBlockConfigs.length);
		const contentBlockFormKey = getFormKey(newConfig.name, contentBlockConfigs.length);

		// Update content block configs
		onAdd(newConfig);

		// Set newly added config accordion as open
		setAccordionsOpenState({ [contentBlockFormKey]: true });
	};

	const handleReorderContentBlock = (configIndex: number, indexUpdate: number) => {
		// Close accordions
		setAccordionsOpenState({});
		// Trigger reorder
		onReorder(configIndex, indexUpdate);
	};

	// Render
	const renderContentBlockForms = () => {
		return contentBlockConfigs.map((contentBlockConfig, index) => {
			const contentBlockFormKey = getFormKey(contentBlockConfig.name, index);

			return (
				<ContentBlockForm
					key={createKey('form', index)}
					config={contentBlockConfig}
					blockIndex={index}
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
					removeComponentFromState={(stateIndex: number) =>
						removeComponentFromState(index, stateIndex)
					}
					onRemove={onRemove}
					onReorder={handleReorderContentBlock}
				/>
			);
		});
	};

	const renderBlockPreviews = () =>
		contentBlockConfigs.map((contentBlockConfig, blockIndex) => {
			const { components, block } = contentBlockConfig;

			return (
				<ContentBlockPreview
					key={createKey('preview', blockIndex)}
					componentState={components.state}
					contentWidth={contentWidth}
					blockState={block.state}
					history={history}
					location={location}
					match={match}
					user={user}
				/>
			);
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
