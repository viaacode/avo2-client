import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import {
	BlockButtons,
	BlockCTAs,
	BlockHeading,
	BlockIFrame,
	BlockIntro,
	BlockRichText,
	Container,
} from '@viaa/avo2-components';

import { ContentWidth } from '../../../content/content.types';

import {
	ContentBlockBackgroundColor,
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
} from '../../content-block.types';

interface ContentBlockPreviewProps {
	componentState: ContentBlockComponentState | ContentBlockComponentState[];
	contentWidth: ContentWidth;
	blockState: ContentBlockState;
}

const CONTENT_WIDTH_MAP: { [key in ContentWidth]: 'regular' | 'large' | 'medium' } = {
	REGULAR: 'regular',
	LARGE: 'large',
	MEDIUM: 'medium',
};
const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
	[ContentBlockType.IFrame]: BlockIFrame,
});

const REPEATABLE_CONTENT_BLOCKS = [
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
];

export const BLOCK_STATE_INHERITING_PROPS = ['align'];

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({
	componentState,
	contentWidth = 'REGULAR',
	blockState,
}) => {
	const containerSize = CONTENT_WIDTH_MAP[contentWidth];
	const PreviewComponent = COMPONENT_PREVIEW_MAP[blockState.blockType];
	const needsElements = REPEATABLE_CONTENT_BLOCKS.includes(blockState.blockType);
	const stateToSpread: any = needsElements ? { elements: componentState } : componentState;

	BLOCK_STATE_INHERITING_PROPS.forEach((prop: string) => {
		if ((blockState as any)[prop]) {
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
			<Container mode="horizontal" size={containerSize === 'regular' ? undefined : containerSize}>
				<PreviewComponent {...stateToSpread} />
			</Container>
		</div>
	);
};

export default ContentBlockPreview;
