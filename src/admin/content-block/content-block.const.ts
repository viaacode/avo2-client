import {
	ButtonType,
	Checkbox,
	ContentItemStyle,
	ContentTabStyle,
	DatePicker,
	MultiRange,
	Select,
	SelectOption,
	TextArea,
	TextInput,
} from '@viaa/avo2-components';

import { FileUpload } from '../../shared/components';
import WYSIWYGWrapper from '../../shared/components/WYSIWYGWrapper/WYSIWYGWrapper';
import { tText } from '../../shared/helpers/translate';
import { UserGroupSelect } from '../shared/components';
// TODO investigate why these cannot be loaded from the barrel file: src/admin/shared/components/index.ts
// More info on the bug that occurs:
// https://github.com/viaacode/avo2-client/commit/7112c51cc1a84d482b5f67b21326784be8df42f3
import { ContentPicker } from '../shared/components/ContentPicker/ContentPicker';
import { ContentTypeAndLabelsPicker } from '../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';
import { IconPicker } from '../shared/components/IconPicker/IconPicker';
import {
	AlignOption,
	BlockGridFormatOption,
	Color,
	ContentBlockConfig,
	ContentBlockType,
	FillOption,
	HeadingTypeOption,
	WidthOption,
} from '../shared/types';

import { AlignSelect, ColorSelect, PaddingSelect } from './components';
import {
	ANCHOR_LINKS_BLOCK_CONFIG,
	INITIAL_ANCHOR_LINKS_COMPONENTS_STATE,
} from './helpers/generators/anchor-links';
import {
	BUTTONS_BLOCK_CONFIG,
	INITIAL_BUTTONS_COMPONENTS_STATE,
} from './helpers/generators/buttons';
import {
	CONTENT_PAGE_META_BLOCK_CONFIG,
	INITIAL_CONTENT_PAGE_META_COMPONENTS_STATE,
} from './helpers/generators/content-page-meta';
import { CTAS_BLOCK_CONFIG, INITIAL_CTAS_COMPONENTS_STATE } from './helpers/generators/ctas';
import {
	EVENTBRITE_BLOCK_CONFIG,
	INITIAL_EVENTBRITE_COMPONENTS_STATE,
} from './helpers/generators/eventbrite';
import {
	HEADING_BLOCK_CONFIG,
	INITIAL_HEADING_COMPONENTS_STATE,
} from './helpers/generators/heading';
import { HERO_BLOCK_CONFIG, INITIAL_HERO_COMPONENTS_STATE } from './helpers/generators/hero';
import { IFRAME_BLOCK_CONFIG, INITIAL_IFRAME_COMPONENTS_STATE } from './helpers/generators/iframe';
import { IMAGE_BLOCK_CONFIG, INITIAL_IMAGE_COMPONENTS_STATE } from './helpers/generators/image';
import {
	IMAGE_GRID_BLOCK_CONFIG,
	INITIAL_IMAGE_GRID_COMPONENTS_STATE,
} from './helpers/generators/image-grid';
import { INITIAL_INTRO_COMPONENTS_STATE, INTRO_BLOCK_CONFIG } from './helpers/generators/intro';
import { INITIAL_KLAAR_COMPONENTS_STATE, KLAAR_BLOCK_CONFIG } from './helpers/generators/klaar';
import {
	INITIAL_LOGO_GRID_COMPONENTS_STATE,
	LOGO_GRID_BLOCK_CONFIG,
} from './helpers/generators/logo-grid';
import {
	INITIAL_MEDIA_GRID_COMPONENTS_STATE,
	MEDIA_GRID_BLOCK_CONFIG,
} from './helpers/generators/media-grid';
import {
	INITIAL_MEDIA_PLAYER_COMPONENTS_STATE,
	MEDIA_PLAYER_BLOCK_CONFIG,
} from './helpers/generators/media-player';
import {
	INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_COMPONENTS_STATE,
	MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_CONFIG,
} from './helpers/generators/media-player-title-text-button';
import {
	INITIAL_PAGE_OVERVIEW_COMPONENTS_STATE,
	PAGE_OVERVIEW_BLOCK_CONFIG,
} from './helpers/generators/page-overview';
import {
	INITIAL_PROJECTS_SPOTLIGHT_COMPONENTS_STATE,
	PROJECTS_SPOTLIGHT_BLOCK_CONFIG,
} from './helpers/generators/project-spotlight';
import { INITIAL_QUOTE_COMPONENTS_STATE, QUOTE_BLOCK_CONFIG } from './helpers/generators/quote';
import {
	INITIAL_RICH_TEXT_COMPONENTS_STATE,
	RICH_TEXT_BLOCK_CONFIG,
} from './helpers/generators/rich-text';
import {
	INITIAL_RICH_TEXT_TWO_COLUMNS_COMPONENTS_STATE,
	RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
} from './helpers/generators/rich-text-two-columns';
import { INITIAL_SEARCH_COMPONENTS_STATE, SEARCH_BLOCK_CONFIG } from './helpers/generators/search';
import {
	INITIAL_SPOTLIGHT_COMPONENTS_STATE,
	SPOTLIGHT_BLOCK_CONFIG,
} from './helpers/generators/spotlight';
import {
	INITIAL_USP_GRID_COMPONENTS_STATE,
	USP_GRID_BLOCK_CONFIG,
} from './helpers/generators/usp-grid';

export const GET_CONTENT_BLOCK_TYPE_OPTIONS: () => SelectOption<string>[] = () => [
	{
		label: tText('admin/content-block/content-block___voeg-een-content-blok-toe'),
		value: '',
		disabled: true,
	},
	{
		label: tText('admin/content-block/content-block___titel'),
		value: ContentBlockType.Heading,
	},
	{
		label: tText('admin/content-block/content-block___tekst'),
		value: ContentBlockType.RichText,
	},
	{
		label: tText('admin/content-block/content-block___tekst-2-kolommen'),
		value: ContentBlockType.RichTextTwoColumns,
	},
	{
		label: tText('admin/content-block/content-block___knoppen'),
		value: ContentBlockType.Buttons,
	},
	{
		label: tText('admin/content-block/content-block___intro'),
		value: ContentBlockType.Intro,
	},
	{
		label: tText('admin/content-block/content-block___2-ct-as'),
		value: ContentBlockType.Ctas,
	},
	{
		label: tText('admin/content-block/content-block___i-frame'),
		value: ContentBlockType.Iframe,
	},
	{
		label: tText('admin/content-block/content-block___klaar'),
		value: ContentBlockType.Klaar,
	},
	{
		label: tText('admin/content-block/content-block___media-tegels'),
		value: ContentBlockType.MediaGrid,
	},
	{
		label: tText('admin/content-block/content-block___media-speler'),
		value: ContentBlockType.MediaPlayer,
	},
	{
		label: tText('admin/content-block/content-block___media-speler-met-titel-tekst-en-knop'),
		value: ContentBlockType.MediaPlayerTitleTextButton,
	},
	{
		label: tText('admin/content-block/content-block___afbeelding'),
		value: ContentBlockType.Image,
	},
	{
		label: tText('admin/content-block/content-block___afbeelding-grid'),
		value: ContentBlockType.ImageGrid,
	},
	{
		label: tText('admin/content-block/content-block___pagina-overzicht'),
		value: ContentBlockType.PageOverview,
	},
	{
		label: tText('admin/content-block/content-block___projecten-in-de-kijker'),
		value: ContentBlockType.ProjectsSpotlight,
	},
	{
		label: tText('admin/content-block/content-block___in-de-kijker'),
		value: ContentBlockType.Spotlight,
	},
	{
		label: tText('admin/content-block/content-block___quote'),
		value: ContentBlockType.Quote,
	},
	{
		label: tText('admin/content-block/helpers/generators/anchor-links___links'),
		value: ContentBlockType.AnchorLinks,
	},
	{
		label: tText('admin/content-block/content-block___hero'),
		value: ContentBlockType.Hero,
	},
	{
		label: tText('admin/content-block/content-block___zoek'),
		value: ContentBlockType.Search,
	},
	{
		label: tText('admin/content-block/content-block___pagina-metadata'),
		value: ContentBlockType.ContentPageMeta,
	},
	{
		label: tText('admin/content-block/content-block___logos-sign-off'),
		value: ContentBlockType.LogoGrid,
	},
	{
		label: tText('admin/content-block/content-block___usp'),
		value: ContentBlockType.UspGrid,
	},
	{
		label: tText('admin/content-block/content-block___eventbrite'),
		value: ContentBlockType.Eventbrite,
	},
];

export const EDITOR_TYPES_MAP = {
	AlignSelect,
	Checkbox,
	ColorSelect,
	ContentPicker,
	ContentTypeAndLabelsPicker,
	DatePicker,
	FileUpload,
	IconPicker,
	MultiRange,
	PaddingSelect,
	Select,
	TextArea,
	TextInput,
	UserGroupSelect,
	WYSIWYG: WYSIWYGWrapper,
};

type ContentBlockConfigLookup = Partial<
	Record<ContentBlockType, (position: number) => ContentBlockConfig>
>;

// TODO see if partial is needed, or if the missing properties should be added
export const CONTENT_BLOCK_CONFIG_MAP: ContentBlockConfigLookup = {
	[ContentBlockType.AnchorLinks]: ANCHOR_LINKS_BLOCK_CONFIG,
	[ContentBlockType.Buttons]: BUTTONS_BLOCK_CONFIG,
	[ContentBlockType.Ctas]: CTAS_BLOCK_CONFIG,
	[ContentBlockType.Heading]: HEADING_BLOCK_CONFIG,
	[ContentBlockType.Hero]: HERO_BLOCK_CONFIG,
	[ContentBlockType.Iframe]: IFRAME_BLOCK_CONFIG,
	[ContentBlockType.Image]: IMAGE_BLOCK_CONFIG,
	[ContentBlockType.ImageGrid]: IMAGE_GRID_BLOCK_CONFIG,
	[ContentBlockType.Intro]: INTRO_BLOCK_CONFIG,
	[ContentBlockType.Klaar]: KLAAR_BLOCK_CONFIG,
	[ContentBlockType.MediaGrid]: MEDIA_GRID_BLOCK_CONFIG,
	[ContentBlockType.MediaPlayer]: MEDIA_PLAYER_BLOCK_CONFIG,
	[ContentBlockType.MediaPlayerTitleTextButton]: MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_CONFIG,
	[ContentBlockType.Quote]: QUOTE_BLOCK_CONFIG,
	[ContentBlockType.PageOverview]: PAGE_OVERVIEW_BLOCK_CONFIG,
	[ContentBlockType.ProjectsSpotlight]: PROJECTS_SPOTLIGHT_BLOCK_CONFIG,
	[ContentBlockType.Spotlight]: SPOTLIGHT_BLOCK_CONFIG,
	[ContentBlockType.RichText]: RICH_TEXT_BLOCK_CONFIG,
	[ContentBlockType.RichTextTwoColumns]: RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
	[ContentBlockType.Search]: SEARCH_BLOCK_CONFIG,
	[ContentBlockType.ContentPageMeta]: CONTENT_PAGE_META_BLOCK_CONFIG,
	[ContentBlockType.LogoGrid]: LOGO_GRID_BLOCK_CONFIG,
	[ContentBlockType.UspGrid]: USP_GRID_BLOCK_CONFIG,
	[ContentBlockType.Eventbrite]: EVENTBRITE_BLOCK_CONFIG,
};

type ContentBlockInitialConfigLookup = Partial<Record<ContentBlockType, () => any>>;

export const CONTENT_BLOCK_INITIAL_STATE_MAP: ContentBlockInitialConfigLookup = {
	[ContentBlockType.AnchorLinks]: INITIAL_ANCHOR_LINKS_COMPONENTS_STATE,
	[ContentBlockType.Buttons]: INITIAL_BUTTONS_COMPONENTS_STATE,
	[ContentBlockType.Ctas]: INITIAL_CTAS_COMPONENTS_STATE,
	[ContentBlockType.Heading]: INITIAL_HEADING_COMPONENTS_STATE,
	[ContentBlockType.Hero]: INITIAL_HERO_COMPONENTS_STATE,
	[ContentBlockType.Iframe]: INITIAL_IFRAME_COMPONENTS_STATE,
	[ContentBlockType.Image]: INITIAL_IMAGE_COMPONENTS_STATE,
	[ContentBlockType.ImageGrid]: INITIAL_IMAGE_GRID_COMPONENTS_STATE,
	[ContentBlockType.Intro]: INITIAL_INTRO_COMPONENTS_STATE,
	[ContentBlockType.Klaar]: INITIAL_KLAAR_COMPONENTS_STATE,
	[ContentBlockType.MediaGrid]: INITIAL_MEDIA_GRID_COMPONENTS_STATE,
	[ContentBlockType.MediaPlayer]: INITIAL_MEDIA_PLAYER_COMPONENTS_STATE,
	[ContentBlockType.MediaPlayerTitleTextButton]:
		INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_COMPONENTS_STATE,
	[ContentBlockType.PageOverview]: INITIAL_PAGE_OVERVIEW_COMPONENTS_STATE,
	[ContentBlockType.ProjectsSpotlight]: INITIAL_PROJECTS_SPOTLIGHT_COMPONENTS_STATE,
	[ContentBlockType.Spotlight]: INITIAL_SPOTLIGHT_COMPONENTS_STATE,
	[ContentBlockType.Quote]: INITIAL_QUOTE_COMPONENTS_STATE,
	[ContentBlockType.RichText]: INITIAL_RICH_TEXT_COMPONENTS_STATE,
	[ContentBlockType.RichTextTwoColumns]: INITIAL_RICH_TEXT_TWO_COLUMNS_COMPONENTS_STATE,
	[ContentBlockType.Search]: INITIAL_SEARCH_COMPONENTS_STATE,
	[ContentBlockType.ContentPageMeta]: INITIAL_CONTENT_PAGE_META_COMPONENTS_STATE,
	[ContentBlockType.LogoGrid]: INITIAL_LOGO_GRID_COMPONENTS_STATE,
	[ContentBlockType.UspGrid]: INITIAL_USP_GRID_COMPONENTS_STATE,
	[ContentBlockType.Eventbrite]: INITIAL_EVENTBRITE_COMPONENTS_STATE,
};

// Options
const transparentOption = () => ({
	label: tText('admin/content-block/content-block___geen'),
	value: Color.Transparent,
});
const whiteOption = () => ({
	label: tText('admin/content-block/content-block___wit'),
	value: Color.White,
});
const gray50Option = () => ({
	label: tText('admin/content-block/content-block___grijs'),
	value: Color.Gray50,
});
const softBlueOption = () => ({
	label: tText('admin/content-block/content-block___zachtblauw'),
	value: Color.SoftBlue,
});
const nightBlueOption = () => ({
	label: tText('admin/content-block/content-block___nachtblauw'),
	value: Color.NightBlue,
});
const tealOption = () => ({
	label: tText('admin/content-block/content-block___appelblauwzeegroen'),
	value: Color.Teal,
});
const tealBrightOption = () => ({
	label: tText('admin/content-block/content-block___appelblauwzeegroen-helder'),
	value: Color.TealBright,
});
const oceanGreenOption = () => ({
	label: tText('admin/content-block/content-block___oceaangroen'),
	value: Color.OceanGreen,
});
const yellowOption = () => ({
	label: tText('admin/content-block/content-block___leerlingen-geel'),
	value: Color.Yellow,
});

export const GET_BACKGROUND_COLOR_OPTIONS: () => SelectOption<Color>[] = () => [
	transparentOption(),
	whiteOption(),
	gray50Option(),
	softBlueOption(),
	nightBlueOption(),
	tealOption(),
	tealBrightOption(),
	oceanGreenOption(),
	yellowOption(),
];

export const GET_HERO_BACKGROUND_COLOR_OPTIONS: () => SelectOption<Color>[] = () => [
	softBlueOption(),
	nightBlueOption(),
	tealOption(),
	tealBrightOption(),
	oceanGreenOption(),
	yellowOption(),
];

export const GET_FOREGROUND_COLOR_OPTIONS: () => SelectOption<Color>[] = () => [
	{
		label: tText('admin/content-block/content-block___zwart'),
		value: Color.Black,
	},
	{
		label: tText('admin/content-block/content-block___donker-grijs'),
		value: Color.Gray700,
	},
	{
		label: tText('admin/content-block/content-block___grijs'),
		value: Color.Gray50,
	},
	{
		label: tText('admin/content-block/content-block___wit'),
		value: Color.White,
	},
];

export const GET_DARK_BACKGROUND_COLOR_OPTIONS: () => Color[] = () => [
	Color.SoftBlue,
	Color.NightBlue,
	Color.Teal,
	Color.TealBright,
	Color.OceanGreen,
	Color.Yellow,
];

export const GET_ALIGN_OPTIONS: () => { label: string; value: AlignOption }[] = () => [
	{
		label: tText('admin/content-block/content-block___links'),
		value: 'left',
	},
	{
		label: tText('admin/content-block/content-block___gecentreerd'),
		value: 'center',
	},
	{
		label: tText('admin/content-block/content-block___rechts'),
		value: 'right',
	},
];

export const GET_HEADING_TYPE_OPTIONS: () => SelectOption<HeadingTypeOption>[] = () => [
	{
		label: tText('admin/content-block/content-block___h-2'),
		value: 'h2',
	},
	{
		label: tText('admin/content-block/content-block___h-3'),
		value: 'h3',
	},
	{
		label: tText('admin/content-block/content-block___h-4'),
		value: 'h4',
	},
];

export const GET_FULL_HEADING_TYPE_OPTIONS: () => SelectOption<HeadingTypeOption>[] = () => [
	{
		label: tText('admin/content-block/content-block___h-1'),
		value: 'h1',
	},
	...GET_HEADING_TYPE_OPTIONS(),
];

export const GET_BUTTON_TYPE_OPTIONS: () => SelectOption<ButtonType>[] = () => [
	{
		label: tText('admin/content-block/content-block___primair'),
		value: 'primary',
	},
	{
		label: tText('admin/content-block/content-block___secundair'),
		value: 'secondary',
	},
	{
		label: tText('admin/content-block/content-block___secundair-invers'),
		value: 'secondary-i',
	},
	{
		label: tText('admin/content-block/content-block___tertiair'),
		value: 'tertiary',
	},
	{
		label: tText('admin/content-block/content-block___randloos'),
		value: 'borderless',
	},
	{
		label: tText('admin/content-block/content-block___randloos-invers'),
		value: 'borderless-i',
	},
	{
		label: tText('admin/content-block/content-block___gevaar'),
		value: 'danger',
	},
	{
		label: tText('admin/content-block/content-block___gevaar-hover'),
		value: 'danger-hover',
	},
	{
		label: tText('admin/content-block/content-block___link'),
		value: 'link',
	},
	{
		label: tText('admin/content-block/content-block___link-inline'),
		value: 'inline-link',
	},
	{
		label: tText('admin/content-block/content-block___leerling-primair-geel'),
		value: 'pupil-primary',
	},
	{
		label: tText('admin/content-block/content-block___leerling-link-tekst-in-geel'),
		value: 'pupil-link',
	},
	{
		label: tText('admin/content-block/content-block___leerling-link-geel-inline'),
		value: 'pupil-inline-link',
	},
];

export const GET_UNDERLINED_LINK_BUTTON_TYPE_OPTIONS: () => SelectOption<ButtonType>[] = () => [
	{
		label: tText('admin/content-block/content-block___blauw'),
		value: 'underlined-link',
	},
	{
		label: tText('admin/content-block/content-block___geel'),
		value: 'pupil-underlined-link',
	},
];

export const GET_MEDIA_PLAYER_WIDTH_OPTIONS: () => SelectOption<WidthOption>[] = () => [
	{
		label: tText('admin/content-block/content-block___paginabreedte'),
		value: '100%',
	},
	{
		label: tText('admin/content-block/content-block___groot'),
		value: '700px',
	},
	{
		label: tText('admin/content-block/content-block___medium'),
		value: '500px',
	},
	{
		label: tText('admin/content-block/content-block___klein'),
		value: '400px',
	},
];

export const GET_WIDTH_OPTIONS: () => SelectOption<WidthOption>[] = () => [
	{
		label: tText('admin/content-block/content-block___schermbreedte-header'),
		value: 'page-header',
	},
	{
		label: tText('admin/content-block/content-block___schermbreedte'),
		value: 'full-width',
	},
	...GET_MEDIA_PLAYER_WIDTH_OPTIONS(),
];

export const GET_FILL_OPTIONS: () => SelectOption<FillOption>[] = () => [
	{
		label: tText('admin/content-block/content-block___opvullen'),
		value: 'cover',
	},
	{
		label: tText('admin/content-block/content-block___volledig-zichtbaar'),
		value: 'contain',
	},
	{
		label: tText('admin/content-block/content-block___oorspronkelijke-grootte'),
		value: 'auto',
	},
];

export const GET_IMAGE_GRID_FORMAT_OPTIONS: () => SelectOption<BlockGridFormatOption>[] = () => [
	{
		label: tText('admin/content-block/content-block___vierkant-klein-200-x-200'),
		value: 'squareSmall',
	},
	{
		label: tText('admin/content-block/content-block___vierkant-groot-275-x-275'),
		value: 'squareLarge',
	},
	{
		label: tText('admin/content-block/content-block___4-x-3-400-x-300'),
		value: '4:3',
	},
	{
		label: tText('admin/content-block/content-block___2-x-1-200-x-100'),
		value: '2:1',
	},
	{
		label: tText('admin/content-block/content-block___6-x-9-400-x-225'),
		value: '6:9',
	},
	{
		label: tText('admin/content-block/content-block___400-x-150'),
		value: '400x150',
	},
];

export const GET_PAGE_OVERVIEW_TAB_STYLE_OPTIONS: () => SelectOption<ContentTabStyle>[] = () => [
	{
		label: tText('admin/content-block/content-block___menu-balk'),
		value: 'MENU_BAR',
	},
	{
		label: tText('admin/content-block/content-block___tags'),
		value: 'ROUNDED_BADGES',
	},
];

export const GET_PAGE_OVERVIEW_ITEM_STYLE_OPTIONS: () => SelectOption<ContentItemStyle>[] = () => [
	{
		label: tText('admin/content-block/content-block___nieuws-lijst'),
		value: 'NEWS_LIST',
	},
	{
		label: tText('admin/content-block/content-block___projecten-lijst'),
		value: 'PROJECT_LIST',
	},
	{
		label: tText('admin/content-block/content-block___grid'),
		value: 'GRID',
	},
	{
		label: tText('admin/content-block/content-block___accrodions'),
		value: 'ACCORDION',
	},
];

export type PageOverviewOrderOptions =
	| 'published_at__asc'
	| 'published_at__desc'
	| 'title__asc'
	| 'title__desc';

export const GET_PAGE_OVERVIEW_ORDER_OPTIONS: () => SelectOption<PageOverviewOrderOptions>[] =
	() => [
		{
			label: tText('admin/content-block/content-block___publicatie-datum-nieuw-oud'),
			value: 'published_at__desc',
		},
		{
			label: tText('admin/content-block/content-block___publicatie-datum-oud-nieuw'),
			value: 'published_at__asc',
		},
		{
			label: tText('admin/content-block/content-block___titel-a-z'),
			value: 'title__asc',
		},
		{
			label: tText('admin/content-block/content-block___titel-z-a'),
			value: 'title__desc',
		},
	];
