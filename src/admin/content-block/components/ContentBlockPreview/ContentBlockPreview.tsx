import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import { BlockRichText } from '@viaa/avo2-components';

import {
	ContentBlockBackgroundColor,
	ContentBlockFormStates,
	ContentBlockType,
	RichTextTwoColumnsBlockFormState,
} from '../../content-block.types';
import { HeadingBlockPreview } from './previews';

interface ContentBlockPreviewProps {
	state: ContentBlockFormStates;
}

const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.Buttons]: BlockRichText,
	[ContentBlockType.Heading]: HeadingBlockPreview,
	[ContentBlockType.Intro]: BlockRichText,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
});

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({ state }) => {
	const PreviewComponent = COMPONENT_PREVIEW_MAP[state.blockType];

	// TODO: Not sure this is the best place to do this
	if (state.blockType === ContentBlockType.RichTextTwoColumns) {
		// Map state values correctly for preview component
		const { firstColumnContent, secondColumnContent } = state as RichTextTwoColumnsBlockFormState;
		(state as any).content = [firstColumnContent, secondColumnContent];
	}

	return (
		// TODO: Extend spacer with paddings in components lib
		// This way we can easily set paddings from a content-blocks formState
		<div
			className={classnames(`u-bg-${state.backgroundColor} u-padding`, {
				'u-color-white': state.backgroundColor === ContentBlockBackgroundColor.NightBlue,
			})}
		>
			<PreviewComponent {...(state as any)} />
		</div>
	);
};

export default ContentBlockPreview;
