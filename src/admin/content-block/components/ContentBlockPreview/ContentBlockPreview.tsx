import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

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
	ButtonAction,
	Container,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { navigateToContentType } from '../../../../shared/helpers';

import {
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
} from '../../../shared/types';
import {
	CONTENT_BLOCK_INITIAL_BLOCK_STATE_MAP,
	DARK_BACKGROUND_COLOR_OPTIONS,
} from '../../content-block.const';
import {
	BlockMediaListWrapper,
	MediaPlayer,
	MediaPlayerTitleTextButton,
} from '../../helpers/wrappers';
import PageOverviewWrapper from '../PageOverviewWrapper/PageOverviewWrapper';

interface ContentBlockPreviewProps extends RouteComponentProps {
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
	[ContentBlockType.Accordions]: BlockAccordions,
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.IFrame]: BlockIFrame,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.Image]: BlockImage,
	[ContentBlockType.MediaGrid]: BlockMediaListWrapper,
	[ContentBlockType.MediaPlayer]: MediaPlayer,
	[ContentBlockType.MediaPlayerTitleTextButton]: MediaPlayerTitleTextButton,
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
	ContentBlockType.MediaGrid,
	ContentBlockType.ImageGrid,
	ContentBlockType.ProjectsSpotlight,
];

const IGNORE_BLOCK_LEVEL_PROPS = ['position', 'elements', 'blockType'];

const ContentBlockPreview: FunctionComponent<ContentBlockPreviewProps> = ({
	history,
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

	// TODO: Rewrok these blocks to work exactly the same way.
	if (blockState.blockType === ContentBlockType.Buttons) {
		stateToSpread.elements.forEach(({ action }: any) => {
			stateToSpread.navigate = () => {
				navigateToContentType(action, history);
			};
		});
	}

	if (blockState.blockType === ContentBlockType.CTAs) {
		stateToSpread.elements.forEach((innerState: any) => {
			innerState.navigate = () => {
				navigateToContentType(innerState.buttonAction, history);
			};
		});
	}

	if (blockState.blockType === ContentBlockType.ProjectsSpotlight) {
		stateToSpread.navigate = (buttonAction: ButtonAction) => {
			navigateToContentType(buttonAction, history);
		};
	}

	return (
		// TODO: Extend spacer with paddings in components lib
		// This way we can easily set paddings from a content-blocks blockState
		<div
			className={classnames(`u-bg-${blockState.backgroundColor} u-padding`, {
				'u-color-white': DARK_BACKGROUND_COLOR_OPTIONS.includes(blockState.backgroundColor),
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

export default withRouter(ContentBlockPreview);
