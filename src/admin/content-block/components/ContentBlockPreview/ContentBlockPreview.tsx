import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import {
	BlockAccordions,
	BlockButtons,
	BlockCTAs,
	BlockGrid,
	BlockHeading,
	BlockIFrame,
	BlockImage,
	BlockIntro,
	BlockProjectsSpotlight,
	BlockRichText,
	Container,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { CONTENT_BLOCK_INITIAL_BLOCK_STATE_MAP } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
} from '../../content-block.types';
import PageOverviewWrapper from '../PageOverviewWrapper/PageOverviewWrapper';

interface ContentBlockPreviewProps {
	componentState: ContentBlockComponentState | ContentBlockComponentState[];
	contentWidth?: Avo.Content.ContentWidth;
	blockState: ContentBlockState;
}

enum ContentWidthMap {
	REGULAR = 'regular',
	LARGE = 'large',
	MEDIUM = 'medium',
}

const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
	[ContentBlockType.IFrame]: BlockIFrame,
	[ContentBlockType.Accordions]: BlockAccordions,
	[ContentBlockType.Image]: BlockImage,
	[ContentBlockType.ImageGrid]: BlockGrid,
	[ContentBlockType.PageOverview]: PageOverviewWrapper,
	[ContentBlockType.ProjectsSpotlight]: BlockProjectsSpotlight,
});

export const REPEATABLE_CONTENT_BLOCKS = [
	ContentBlockType.Accordions,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
	ContentBlockType.ImageGrid,
	ContentBlockType.ProjectsSpotlight,
];

const IGNORE_BLOCK_LEVEL_PROPS = ['position', 'elements', 'blockType'];

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({
	componentState,
	contentWidth = 'REGULAR',
	blockState,
}) => {
	const containerSize = ContentWidthMap[contentWidth];
	const PreviewComponent = COMPONENT_PREVIEW_MAP[blockState.blockType];
	const needsElements = REPEATABLE_CONTENT_BLOCKS.includes(blockState.blockType);
	const stateToSpread: any = needsElements ? { elements: componentState } : componentState;

	const initialBlockLevelState = CONTENT_BLOCK_INITIAL_BLOCK_STATE_MAP[blockState.blockType];
	Object.keys(initialBlockLevelState(0)).forEach((prop: string) => {
		if ((blockState as any)[prop] && !IGNORE_BLOCK_LEVEL_PROPS.includes(prop)) {
			stateToSpread[prop] = (blockState as any)[prop];
		}
	});

	return (
		// TODO: Extend spacer with paddings in components lib
		// This way we can easily set paddings from a content-blocks blockState
		<div
			className={classnames(`u-bg-${blockState.backgroundColor} u-padding`, {
				'u-color-white': blockState.backgroundColor === ContentBlockBackgroundColor.NightBlue,
			})}
		>
			<Container
				mode="horizontal"
				size={containerSize === ContentWidthMap.REGULAR ? undefined : containerSize}
			>
				<PreviewComponent {...stateToSpread} />
			</Container>
		</div>
	);
};

export default ContentBlockPreview;
