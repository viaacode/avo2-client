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
	ProjectSpotlightWrapper,
} from '../wrappers';

export const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.AnchorLinks]: BlockButtons,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.IFrame]: BlockIFrame,
	[ContentBlockType.ImageGrid]: BlockGridWrapper,
	[ContentBlockType.Image]: BlockImage,
	[ContentBlockType.Image]: BlockImage,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.MediaGrid]: MediaGridWrapper,
	[ContentBlockType.MediaPlayerTitleTextButton]: MediaPlayerTitleTextButtonWrapper,
	[ContentBlockType.MediaPlayer]: MediaPlayerWrapper,
	[ContentBlockType.PageOverview]: PageOverviewWrapper,
	[ContentBlockType.PageOverview]: PageOverviewWrapper,
	[ContentBlockType.ProjectsSpotlight]: ProjectSpotlightWrapper,
	[ContentBlockType.Quote]: BlockQuote,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.Spotlight]: BlockSpotlight,
});

export const REPEATABLE_CONTENT_BLOCKS = [
	ContentBlockType.AnchorLinks,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.ImageGrid,
	ContentBlockType.MediaGrid,
	ContentBlockType.ProjectsSpotlight,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
	ContentBlockType.Spotlight,
];

export const NAVIGABLE_CONTENT_BLOCKS = [
	ContentBlockType.AnchorLinks,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.ImageGrid,
	ContentBlockType.ProjectsSpotlight,
	ContentBlockType.Spotlight,
];

export const IGNORE_BLOCK_LEVEL_PROPS = [
	'backgroundColor',
	'headerBackgroundColor',
	'blockType',
	'elements',
	'padding',
	'position',
];
