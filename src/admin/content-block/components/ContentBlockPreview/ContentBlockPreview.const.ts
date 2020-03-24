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
} from '@viaa/avo2-components';
// TODO: Replace Quote by BlockQuote when components 1.34 releases.
import { Quote } from '../Quote/Quote';

import { ContentBlockType } from '../../../shared/types';
import {
	MediaGridWrapper,
	MediaPlayerTitleTextButtonWrapper,
	MediaPlayerWrapper,
	PageOverviewWrapper,
} from '../wrappers';

export const COMPONENT_PREVIEW_MAP = Object.freeze({
	[ContentBlockType.Accordions]: BlockAccordions,
	[ContentBlockType.CTAs]: BlockCTAs,
	[ContentBlockType.Buttons]: BlockButtons,
	[ContentBlockType.Heading]: BlockHeading,
	[ContentBlockType.IFrame]: BlockIFrame,
	[ContentBlockType.Intro]: BlockIntro,
	[ContentBlockType.Image]: BlockImage,
	[ContentBlockType.ImageGrid]: BlockGrid,
	[ContentBlockType.MediaGrid]: MediaGridWrapper,
	[ContentBlockType.MediaPlayer]: MediaPlayerWrapper,
	[ContentBlockType.MediaPlayerTitleTextButton]: MediaPlayerTitleTextButtonWrapper,
	[ContentBlockType.Quote]: Quote,
	[ContentBlockType.RichText]: BlockRichText,
	[ContentBlockType.RichTextTwoColumns]: BlockRichText,
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

export const NAVIGABLE_CONTENT_BLOCKS = [
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.ProjectsSpotlight,
];

export const IGNORE_BLOCK_LEVEL_PROPS = [
	'backgroundColor',
	'blockType',
	'elements',
	'padding',
	'position',
];
