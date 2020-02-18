import classnames from 'classnames';
import React, { FunctionComponent } from 'react';
import { RouteComponentProps, withRouter } from 'react-router-dom';

import {
	BlockAccordions,
	BlockButtons,
	BlockCTAs,
	BlockHeading,
	BlockIFrame,
	BlockImage,
	BlockIntro,
	BlockRichText,
	Container,
} from '@viaa/avo2-components';
import { Avo } from '@viaa/avo2-types';

import { navigateToContentType } from '../../../../shared/helpers';

import {
	ContentBlockBackgroundColor,
	ContentBlockComponentState,
	ContentBlockState,
	ContentBlockType,
} from '../../content-block.types';
import { MediaPlayer, MediaPlayerTitleTextButton } from '../../helpers/wrappers';

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
	[ContentBlockType.MediaPlayer]: MediaPlayer,
	[ContentBlockType.MediaPlayerTitleTextButton]: MediaPlayerTitleTextButton,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
});

const REPEATABLE_CONTENT_BLOCKS = [
	ContentBlockType.Accordions,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
];

export const BLOCK_STATE_INHERITING_PROPS = ['align'];

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

	BLOCK_STATE_INHERITING_PROPS.forEach((prop: string) => {
		if ((blockState as any)[prop]) {
			stateToSpread[prop] = (blockState as any)[prop];
		}
	});

	// TODO: Change BlockCTA to the way Buttons works so that we don't have to add navigate to each CTA element + then we can remove one of the two following conditional statements..
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

export default withRouter(ContentBlockPreview);
