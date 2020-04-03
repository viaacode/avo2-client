import React, { FunctionComponent, RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';
import ResizablePanels from 'resizable-panels-react';

import { Navbar, Select } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentBlockForm, ContentBlockPreview } from '../../content-block/components';
import {
	CONTENT_BLOCK_CONFIG_MAP,
	GET_CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import { Sidebar } from '../../shared/components';
import { createKey } from '../../shared/helpers';
import {
	ContentBlockConfig,
	ContentBlockStateOption,
	ContentBlockStateType,
	ContentBlockType,
} from '../../shared/types';

interface ContentEditContentBlocksProps {
	contentBlockConfigs: ContentBlockConfig[];
	contentWidth: Avo.Content.ContentWidth;
	onAdd: (config: ContentBlockConfig) => void;
	onRemove: (configIndex: number) => void;
	onReorder: (configIndex: number, indexUpdate: number) => void;
	onSave: (
		index: number,
		formGroupType: ContentBlockStateType,
		formGroupState: ContentBlockStateOption,
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
}) => {
	const [t] = useTranslation();

	// Hooks
	const [accordionsOpenState, setAccordionsOpenState] = useState<{ [key: string]: boolean }>({});

	const previewScrollable: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
	const sidebarScrollable: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

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

		// Scroll preview and sidebar to the bottom
		scrollToBottom(previewScrollable);
		scrollToBottom(sidebarScrollable);
	};

	const scrollToBottom = (ref: RefObject<HTMLDivElement>) => {
		setTimeout(() => {
			if (ref.current) {
				ref.current.scroll({ left: 0, top: 1000000, behavior: 'smooth' });
			}
		}, 0);
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
					onChange={(
						formGroupType: ContentBlockStateType,
						input: any,
						stateIndex?: number
					) => onSave(index, formGroupType, input, stateIndex)}
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
				/>
			);
		});

	return (
		<div className="m-resizable-panels m-edit-content-blocks">
			<ResizablePanels
				displayDirection="row"
				panelsSize={[60, 40]}
				sizeUnitMeasure="%"
				resizerSize="15px"
			>
				<div className="c-content-edit-view__preview" ref={previewScrollable}>
					{renderBlockPreviews()}
				</div>
				<Sidebar className="c-content-edit-view__sidebar" light>
					<Navbar background="alt">
						<Select
							options={GET_CONTENT_BLOCK_TYPE_OPTIONS()}
							onChange={value => handleAddContentBlock(value as ContentBlockType)}
							placeholder={t('Voeg een content blok toe')}
							value={null}
						/>
					</Navbar>
					<div className="c-scrollable" ref={sidebarScrollable}>
						{renderContentBlockForms()}
					</div>
				</Sidebar>
			</ResizablePanels>
		</div>
	);
};

export default ContentEditContentBlocks;
