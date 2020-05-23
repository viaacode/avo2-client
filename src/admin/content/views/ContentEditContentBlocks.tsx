import { get } from 'lodash-es';
import React, { FunctionComponent, RefObject, useRef, useState } from 'react';
import { useTranslation } from 'react-i18next';

import { Navbar, Select } from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { ContentPage } from '../../../content-page/views';
import { ResizablePanels } from '../../../shared/components';
import { ContentBlockForm } from '../../content-block/components';
import {
	CONTENT_BLOCK_CONFIG_MAP,
	GET_CONTENT_BLOCK_TYPE_OPTIONS,
} from '../../content-block/content-block.const';
import { Sidebar } from '../../shared/components';
import { createKey } from '../../shared/helpers';
import {
	ContentBlockConfig,
	ContentBlockErrors,
	ContentBlockStateOption,
	ContentBlockStateType,
	ContentBlockType,
} from '../../shared/types';
import { ContentService } from '../content.service';
import { BlockClickHandler } from '../content.types';

import './ContentEditContentBlocks.scss';

interface ContentEditContentBlocksProps {
	contentBlockConfigs: ContentBlockConfig[];
	contentWidth: Avo.Content.ContentWidth;
	hasSubmitted: boolean;
	onAdd: (config: ContentBlockConfig) => void;
	onError: (configIndex: number, errors: ContentBlockErrors) => void;
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
	hasSubmitted,
	onAdd,
	onError,
	onRemove,
	onReorder,
	onSave,
	addComponentToState,
	removeComponentFromState,
}) => {
	const [t] = useTranslation();

	// Hooks
	const [activeBlockPosition, setActiveBlockPosition] = useState<number | null>(null);

	const previewScrollable: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);
	const sidebarScrollable: RefObject<HTMLDivElement> = useRef<HTMLDivElement>(null);

	// Methods
	const handleAddContentBlock = (configType: ContentBlockType) => {
		const newConfig = CONTENT_BLOCK_CONFIG_MAP[configType](contentBlockConfigs.length);

		// Update content block configs
		onAdd(newConfig);

		// Scroll preview and sidebar to the bottom
		focusBlock(newConfig.position, 'preview');
		focusBlock(newConfig.position, 'sidebar');
	};

	const handleReorderContentBlock = (configIndex: number, indexUpdate: number) => {
		// Close accordions
		setActiveBlockPosition(null);
		// Trigger reorder
		onReorder(configIndex, indexUpdate);
	};

	/**
	 * https://imgur.com/a/E7TxvUN
	 * @param position
	 * @param type
	 */
	const scrollToBlockPosition: BlockClickHandler = (
		position: number,
		type: 'preview' | 'sidebar'
	) => {
		const blockElem = document.querySelector(`.content-block-${type}-${position}`);
		const scrollable = get(
			type === 'sidebar' ? sidebarScrollable : previewScrollable,
			'current'
		);
		if (!blockElem || !scrollable) {
			return;
		}
		const blockElemTop = blockElem.getBoundingClientRect().top;
		const scrollableTop = scrollable.getBoundingClientRect().top;
		const scrollTop = scrollable.scrollTop;
		const scrollMargin = type === 'sidebar' ? 18 : 0;
		const desiredScrollPosition = Math.max(
			blockElemTop - (scrollableTop - scrollTop) - scrollMargin,
			0
		);
		scrollable.scroll({ left: 0, top: desiredScrollPosition, behavior: 'smooth' });
	};

	const focusBlock: BlockClickHandler = (position: number, type: 'preview' | 'sidebar') => {
		toggleActiveBlock(position, type === 'preview');
		const inverseType = type === 'preview' ? 'sidebar' : 'preview';
		setTimeout(() => {
			scrollToBlockPosition(position, inverseType);
		}, 0);
	};

	const toggleActiveBlock = (position: number, onlyOpen: boolean) => {
		if (position === activeBlockPosition && !onlyOpen) {
			setActiveBlockPosition(null);
		} else {
			setActiveBlockPosition(position);
		}
	};

	// Render
	const renderContentBlockForms = () => {
		return contentBlockConfigs.map((contentBlockConfig, index) => {
			return (
				<div className={`content-block-sidebar-${contentBlockConfig.position}`}>
					<ContentBlockForm
						key={createKey('form', index)}
						config={contentBlockConfig}
						blockIndex={index}
						isAccordionOpen={contentBlockConfig.position === activeBlockPosition}
						length={contentBlockConfigs.length}
						hasSubmitted={hasSubmitted}
						toggleIsAccordionOpen={() => {
							focusBlock(contentBlockConfig.position, 'sidebar');
						}}
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
						onError={onError}
						onRemove={onRemove}
						onReorder={handleReorderContentBlock}
					/>
				</div>
			);
		});
	};

	return (
		<div className="m-resizable-panels m-edit-content-blocks">
			<ResizablePanels
				displayDirection="row"
				panelsSize={[60, 40]}
				sizeUnitMeasure="%"
				resizerSize="15px"
				onResize={() => {
					window.dispatchEvent(new Event('resize'));
				}}
			>
				<div className="c-content-edit-view__preview" ref={previewScrollable}>
					<ContentPage
						contentBlockConfigs={ContentService.convertRichTextEditorStatesToHtml(
							contentBlockConfigs
						)}
						contentWidth={contentWidth}
						onBlockClicked={focusBlock}
						activeBlockPosition={activeBlockPosition}
					/>
				</div>
				<Sidebar className="c-content-edit-view__sidebar" light>
					<Navbar background="alt">
						<Select
							options={GET_CONTENT_BLOCK_TYPE_OPTIONS()}
							onChange={value => handleAddContentBlock(value as ContentBlockType)}
							placeholder={t(
								'admin/content/views/content-edit-content-blocks___voeg-een-content-blok-toe'
							)}
							value={null as any}
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
