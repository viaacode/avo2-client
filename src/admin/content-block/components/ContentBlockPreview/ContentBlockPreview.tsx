import React, { FunctionComponent } from 'react';

import { BlockRichText } from '@viaa/avo2-components';

import { ContentBlockFormStates } from '../../content-block.types';
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
		<div className={`u-bg-${state.backgroundColor} u-padding-top u-padding-bottom`}>
			<PreviewComponent {...state as any} />
		</div>
	);
};

export default ContentBlockPreview;
