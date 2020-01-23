import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import {
	BlockButtons,
	BlockCTAs,
	BlockHeading,
	BlockIntro,
	BlockRichText,
	Container,
} from '@viaa/avo2-components';

import { ContentWidth } from '../../../content/content.types';

import { CONTENT_BLOCKS_WITH_ELEMENTS_PROP } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
	RichTextTwoColumnsBlockComponentState,
} from '../../content-block.types';

interface ContentBlockPreviewProps {
	componentState: ContentBlockComponentState | ContentBlockComponentState[];
	contentWidth: ContentWidth;
	blockState: ContentBlockState;
}

const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
});

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({
	componentState,
	contentWidth = 'default',
	blockState,
}) => {
	const PreviewComponent = COMPONENT_PREVIEW_MAP[blockState.blockType];
	const needsElements = CONTENT_BLOCKS_WITH_ELEMENTS_PROP.includes(blockState.blockType);
	const stateToSpread: any = needsElements ? { elements: componentState } : componentState;

	// TODO: Convert to array-based content block
	if (blockState.blockType === ContentBlockType.RichTextTwoColumns) {
		// Map componentState values correctly for preview component
		const {
			firstColumnContent,
			secondColumnContent,
		} = componentState as RichTextTwoColumnsBlockComponentState;
		(componentState as any).content = [firstColumnContent, secondColumnContent];
	}

	return (
		// TODO: Extend spacer with paddings in components lib
		// This way we can easily set paddings from a content-blocks componentState
		<div
			className={classnames(`u-bg-${blockState.backgroundColor} u-padding`, {
				'u-color-white': blockState.backgroundColor === ContentBlockBackgroundColor.NightBlue,
			})}
		>
			<Container mode="horizontal" size={contentWidth === 'default' ? undefined : contentWidth}>
				<PreviewComponent {...stateToSpread} />
			</Container>
		</div>
	);
};

export default ContentBlockPreview;
