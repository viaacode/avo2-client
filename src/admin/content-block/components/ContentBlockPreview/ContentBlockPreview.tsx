import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import { BlockButtons, BlockIntro, BlockRichText } from '@viaa/avo2-components';

import {
	ContentBlockBackgroundColor,
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
	RichTextTwoColumnsBlockComponentState,
} from '../../content-block.types';
import { HeadingBlockPreview } from './previews';

interface ContentBlockPreviewProps {
	componentState: ContentBlockComponentState | ContentBlockComponentState[];
	blockState: ContentBlockState;
}

const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: HeadingBlockPreview,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
});

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({
	componentState,
	blockState,
}) => {
	console.log(componentState);
	console.log(blockState);
	const PreviewComponent = COMPONENT_PREVIEW_MAP[blockState.blockType];

	// TODO: Not sure this is the best place to do this
	if (blockState.blockType === ContentBlockType.RichTextTwoColumns) {
		// Map componentState values correctly for preview component
		const {
			firstColumnContent,
			secondColumnContent,
		} = componentState as RichTextTwoColumnsBlockComponentState;
		(componentState as any).content = [firstColumnContent, secondColumnContent];
	}

	// TODO: Make more generic and reusable for other components
	if (blockState.blockType === ContentBlockType.Buttons) {
		(componentState as any).buttons = componentState;
	}

	return (
		// TODO: Extend spacer with paddings in components lib
		// This way we can easily set paddings from a content-blocks componentState
		<div
			className={classnames(`u-bg-${blockState.backgroundColor} u-padding`, {
				'u-color-white': blockState.backgroundColor === ContentBlockBackgroundColor.NightBlue,
			})}
		>
			<PreviewComponent {...componentState as any} />
		</div>
	);
};

export default ContentBlockPreview;
