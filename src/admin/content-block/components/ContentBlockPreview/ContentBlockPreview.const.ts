import {
	BlockEventbrite,
	BlockHeading,
	BlockIFrame,
	BlockImage,
	BlockIntro,
	BlockKlaar,
	BlockQuote,
	BlockSpotlight,
} from '@viaa/avo2-components';
import { FunctionComponent } from 'react';

import BlockSearch from '../../../../search/components/BlockSearch';
import { ContentBlockType } from '../../../shared/types';
import {
	BlockImageGridWrapper,
	BlockLogoGridWrapper,
	BlockUspGridWrapper,
	ContentPageMeta,
	CtaWrapper,
	HeroWrapper,
	MediaGridWrapper,
	MediaPlayerTitleTextButtonWrapper,
	MediaPlayerWrapper,
	PageOverviewWrapper,
	ProjectSpotlightWrapper,
} from '../wrappers';
import ButtonsWrapper from '../wrappers/ButtonsWrapper/ButtonsWrapper';
import RichTextWrapper from '../wrappers/RichTextWrapper/RichTextWrapper';

export const COMPONENT_PREVIEW_MAP: Partial<Record<ContentBlockType, FunctionComponent<any>>> =
	Object.freeze({
		[ContentBlockType.AnchorLinks]: ButtonsWrapper,
		[ContentBlockType.Buttons]: ButtonsWrapper,
		[ContentBlockType.Ctas]: CtaWrapper,
		[ContentBlockType.Heading]: BlockHeading,
		[ContentBlockType.Iframe]: BlockIFrame,
		[ContentBlockType.ImageGrid]: BlockImageGridWrapper,
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
		[ContentBlockType.ContentPageMeta]: ContentPageMeta,
		[ContentBlockType.LogoGrid]: BlockLogoGridWrapper,
		[ContentBlockType.UspGrid]: BlockUspGridWrapper,
		[ContentBlockType.Eventbrite]: BlockEventbrite,
	});

export const REPEATABLE_CONTENT_BLOCKS = [
	ContentBlockType.AnchorLinks,
	ContentBlockType.Buttons,
	ContentBlockType.Ctas,
	ContentBlockType.ImageGrid,
	ContentBlockType.MediaGrid,
	ContentBlockType.ProjectsSpotlight,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
	ContentBlockType.Spotlight,
	ContentBlockType.LogoGrid,
	ContentBlockType.UspGrid,
];

/**
 * Blocks that must receive a navigate function so that their buttons can link to their buttonActions
 */
export const NAVIGABLE_CONTENT_BLOCKS = [
	ContentBlockType.AnchorLinks,
	ContentBlockType.Buttons,
	ContentBlockType.Ctas,
	ContentBlockType.ImageGrid,
	ContentBlockType.ProjectsSpotlight,
	ContentBlockType.RichText,
	ContentBlockType.RichTextTwoColumns,
	ContentBlockType.Spotlight,
	ContentBlockType.Hero,
	ContentBlockType.PageOverview,
	ContentBlockType.MediaGrid,
	ContentBlockType.LogoGrid,
	ContentBlockType.UspGrid,
	ContentBlockType.Eventbrite,
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
