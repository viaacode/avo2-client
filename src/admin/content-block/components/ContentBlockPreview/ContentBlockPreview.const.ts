import {
	BlockButtons,
	BlockCTAs,
	BlockHeading,
	BlockIFrame,
	BlockImage,
	BlockIntro,
	BlockKlaar,
	BlockQuote,
	BlockSpotlight,
} from '@viaa/avo2-components';

import BlockSearch from '../../../../search/components/BlockSearch';
import { ContentBlockType } from '../../../shared/types';
import {
	BlockContentPageMeta,
	BlockGridWrapper,
	HeroWrapper,
	MediaGridWrapper,
	MediaPlayerTitleTextButtonWrapper,
	MediaPlayerWrapper,
	PageOverviewWrapper,
	ProjectSpotlightWrapper,
} from '../wrappers';
import RichTextWrapper from '../wrappers/RichTextWrapper/RichTextWrapper';

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
	[ContentBlockType.Klaar]: BlockKlaar,
	[ContentBlockType.MediaPlayerTitleTextButton]: MediaPlayerTitleTextButtonWrapper,
	[ContentBlockType.MediaPlayer]: MediaPlayerWrapper,
	[ContentBlockType.PageOverview]: PageOverviewWrapper,
	[ContentBlockType.PageOverview]: PageOverviewWrapper,
	[ContentBlockType.ProjectsSpotlight]: ProjectSpotlightWrapper,
	[ContentBlockType.Quote]: BlockQuote,
	[ContentBlockType.RichTextTwoColumns]: RichTextWrapper,
	[ContentBlockType.RichTextTwoColumns]: RichTextWrapper,
	[ContentBlockType.RichText]: RichTextWrapper,
	[ContentBlockType.Spotlight]: BlockSpotlight,
	[ContentBlockType.Hero]: HeroWrapper,
	[ContentBlockType.Search]: BlockSearch,
	[ContentBlockType.ContentPageMeta]: BlockContentPageMeta,
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

/**
 * Blocks that must receive a navigate function so that their buttons can link to their buttonActions
 */
export const NAVIGABLE_CONTENT_BLOCKS = [
	ContentBlockType.AnchorLinks,
	ContentBlockType.Buttons,
	ContentBlockType.CTAs,
	ContentBlockType.ImageGrid,
	ContentBlockType.ProjectsSpotlight,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
	ContentBlockType.Spotlight,
	ContentBlockType.Hero,
];

/**
 * Blocks that need access to the top level content page
 * The contentPageInfo property will be added to these blocks automatically
 */
export const CONTENT_PAGE_ACCESS_BLOCKS = [ContentBlockType.ContentPageMeta];

export const IGNORE_BLOCK_LEVEL_PROPS = [
	'backgroundColor',
	'blockType',
	'elements',
	'padding',
	'position',
];
