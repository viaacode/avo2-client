import {
	BlockButtons,
	BlockCTAs,
	BlockHeading,
	BlockIFrame,
	BlockImage,
	BlockIntro,
	BlockQuote,
	BlockRichText,
	BlockSpotlight,
} from '@viaa/avo2-components';

import { ContentBlockType } from '../../../shared/types';
import {
	BlockGridWrapper,
	MediaGridWrapper,
	MediaPlayerTitleTextButtonWrapper,
	MediaPlayerWrapper,
	PageOverviewWrapper,
} from '../wrappers';

export const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.AnchorLinks]: BlockButtons,
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.IFrame]: BlockIFrame,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.Image]: BlockImage,
	[ContentBlockType.ImageGrid]: BlockGridWrapper,
	[ContentBlockType.MediaGrid]: MediaGridWrapper,
	[ContentBlockType.MediaPlayer]: MediaPlayerWrapper,
	[ContentBlockType.MediaPlayerTitleTextButton]: MediaPlayerTitleTextButtonWrapper,
	[ContentBlockType.Quote]: BlockQuote,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
	[ContentBlockType.PageOverview]: PageOverviewWrapper,
	[ContentBlockType.ProjectsSpotlight]: BlockSpotlight,
});

export const REPEATABLE_CONTENT_BLOCKS = [
	ContentBlockType.AnchorLinks,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
	ContentBlockType.MediaGrid,
	ContentBlockType.ImageGrid,
	ContentBlockType.ProjectsSpotlight,
];

export const NAVIGABLE_CONTENT_BLOCKS = [
	ContentBlockType.AnchorLinks,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.ProjectsSpotlight,
	ContentBlockType.ImageGrid,
];

export const IGNORE_BLOCK_LEVEL_PROPS = [
	'backgroundColor',
	'blockType',
	'elements',
	'padding',
	'position',
];
