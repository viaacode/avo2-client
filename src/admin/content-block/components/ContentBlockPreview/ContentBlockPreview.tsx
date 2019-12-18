import classnames from 'classnames';
import React, { FunctionComponent } from 'react';

import { BlockRichText } from '@viaa/avo2-components';

import { ContentBlockBackgroundColor, ContentBlockFormStates } from '../../content-block.types';
import { HeadingBlockPreview } from './previews';

interface ContentBlockPreviewProps {
	state: ContentBlockFormStates;
}

const COMPONENT_PREVIEW_MAP = Object.freeze({
	Heading: HeadingBlockPreview,
	RichText: BlockRichText,
});

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({ state }) => {
	const PreviewComponent = COMPONENT_PREVIEW_MAP[state.blockType];

	return (
		<div
			className={classnames(`u-bg-${state.backgroundColor} u-padding`, {
				'u-color-white': state.backgroundColor === ContentBlockBackgroundColor.NightBlue,
			})}
		>
			<PreviewComponent {...state as any} />
		</div>
	);
};

export default ContentBlockPreview;
