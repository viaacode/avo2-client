import {
	Checkbox,
	MultiRange,
	Select,
	SelectOption,
	TextInput,
	WYSIWYG,
} from '@viaa/avo2-components';

import { IconPicker } from '../../admin/shared/components';
import i18n from '../../shared/translations/i18n';

import { FileUpload } from '../../shared/components';
import { ContentPicker } from '../shared/components';

import {
	ContentItemStyle,
	ContentTabStyle,
} from '@viaa/avo2-components/dist/content-blocks/BlockPageOverview/BlockPageOverview';
import ContentTypeAndLabelsPicker from '../shared/components/ContentTypeAndLabelsPicker/ContentTypeAndLabelsPicker';
import { AlignSelect, ColorSelect } from './components';
import {
	AlignOption,
	ButtonTypeOption,
	ContentBlockBackgroundColor,
	ContentBlockType,
	HeadingLevelOption,
	ImageGridFillOption,
	WidthOption,
} from './content-block.types';
import {
	ACCORDIONS_BLOCK_CONFIG,
	BUTTONS_BLOCK_CONFIG,
	CTAS_BLOCK_CONFIG,
	HEADING_BLOCK_CONFIG,
	IFRAME_BLOCK_CONFIG,
	IMAGE_BLOCK_CONFIG,
	INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES,
	INITIAL_ACCORDIONS_BLOCK_STATE,
	INITIAL_BUTTONS_BLOCK_COMPONENT_STATES,
	INITIAL_BUTTONS_BLOCK_STATE,
	INITIAL_CTAS_BLOCK_COMPONENT_STATES,
	INITIAL_CTAS_BLOCK_STATE,
	INITIAL_HEADING_BLOCK_COMPONENT_STATE,
	INITIAL_HEADING_BLOCK_STATE,
	INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
	INITIAL_IFRAME_BLOCK_STATE,
	INITIAL_IMAGE_BLOCK_COMPONENT_STATE,
	INITIAL_IMAGE_BLOCK_STATE,
	INITIAL_INTRO_BLOCK_COMPONENT_STATE,
	INITIAL_INTRO_BLOCK_STATE,
	INITIAL_MEDIA_PLAYER_BLOCK_COMPONENT_STATE,
	INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_COMPONENT_STATE,
	INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE,
	INITIAL_RICH_TEXT_BLOCK_STATE,
	INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE,
	INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE,
	INTRO_BLOCK_CONFIG,
	MEDIA_PLAYER_BLOCK_CONFIG,
	MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_CONFIG,
	RICH_TEXT_BLOCK_CONFIG,
	RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
} from './helpers';
import {
	IMAGE_GRID_BLOCK_CONFIG,
	INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATES,
	INITIAL_IMAGE_GRID_BLOCK_STATE,
} from './helpers/generators/image-grid';
import {
	INITIAL_PAGE_OVERVIEW_BLOCK_COMPONENT_STATE,
	INITIAL_PAGE_OVERVIEW_BLOCK_STATE,
	PAGE_OVERVIEW_BLOCK_CONFIG,
} from './helpers/generators/page-overview';

export const CONTENT_BLOCKS_RESULT_PATH = {
	GET: 'app_content_blocks',
	INSERT: 'insert_app_content_blocks',
};

export const EDITOR_TYPES_MAP = {
	AlignSelect,
	ColorSelect,
	Select,
	TextInput,
	WYSIWYG,
	IconPicker,
	ContentPicker,
	FileUpload,
	MultiRange,
	ContentTypeAndLabelsPicker,
	Checkbox,
};

export const CONTENT_BLOCK_CONFIG_MAP = {
	[ContentBlockType.Accordions]: ACCORDIONS_BLOCK_CONFIG,
	[ContentBlockType.Accordions]: ACCORDIONS_BLOCK_CONFIG,
	[ContentBlockType.Buttons]: BUTTONS_BLOCK_CONFIG,
	[ContentBlockType.CTAs]: CTAS_BLOCK_CONFIG,
	[ContentBlockType.Heading]: HEADING_BLOCK_CONFIG,
	[ContentBlockType.IFrame]: IFRAME_BLOCK_CONFIG,
	[ContentBlockType.IFrame]: IFRAME_BLOCK_CONFIG,
	[ContentBlockType.ImageGrid]: IMAGE_GRID_BLOCK_CONFIG,
	[ContentBlockType.Image]: IMAGE_BLOCK_CONFIG,
	[ContentBlockType.Image]: IMAGE_BLOCK_CONFIG,
	[ContentBlockType.Intro]: INTRO_BLOCK_CONFIG,
	[ContentBlockType.MediaPlayerTitleTextButton]: MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_CONFIG,
	[ContentBlockType.MediaPlayer]: MEDIA_PLAYER_BLOCK_CONFIG,
	[ContentBlockType.RichTextTwoColumns]: RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
	[ContentBlockType.RichText]: RICH_TEXT_BLOCK_CONFIG,
	[ContentBlockType.RichTextTwoColumns]: RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
	[ContentBlockType.IFrame]: IFRAME_BLOCK_CONFIG,
	[ContentBlockType.Accordions]: ACCORDIONS_BLOCK_CONFIG,
	[ContentBlockType.Image]: IMAGE_BLOCK_CONFIG,
	[ContentBlockType.ImageGrid]: IMAGE_GRID_BLOCK_CONFIG,
	[ContentBlockType.PageOverview]: PAGE_OVERVIEW_BLOCK_CONFIG,
};

export const CONTENT_BLOCK_INITIAL_STATE_MAP = {
	[ContentBlockType.Accordions]: INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Accordions]: INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Buttons]: INITIAL_BUTTONS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.CTAs]: INITIAL_CTAS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Heading]: INITIAL_HEADING_BLOCK_COMPONENT_STATE,
	[ContentBlockType.IFrame]: INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
	[ContentBlockType.IFrame]: INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
	[ContentBlockType.ImageGrid]: INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Image]: INITIAL_IMAGE_BLOCK_COMPONENT_STATE,
	[ContentBlockType.Image]: INITIAL_IMAGE_BLOCK_COMPONENT_STATE,
	[ContentBlockType.Intro]: INITIAL_INTRO_BLOCK_COMPONENT_STATE,
	[ContentBlockType.MediaPlayerTitleTextButton]: INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_COMPONENT_STATE,
	[ContentBlockType.MediaPlayer]: INITIAL_MEDIA_PLAYER_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichTextTwoColumns]: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichText]: INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichTextTwoColumns]: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE,
	[ContentBlockType.IFrame]: INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
	[ContentBlockType.Accordions]: INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Image]: INITIAL_IMAGE_BLOCK_COMPONENT_STATE,
	[ContentBlockType.ImageGrid]: INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATES,
	[ContentBlockType.PageOverview]: INITIAL_PAGE_OVERVIEW_BLOCK_COMPONENT_STATE,
};

export const CONTENT_BLOCK_INITIAL_BLOCK_STATE_MAP = {
	[ContentBlockType.Accordions]: INITIAL_ACCORDIONS_BLOCK_STATE,
	[ContentBlockType.Buttons]: INITIAL_BUTTONS_BLOCK_STATE,
	[ContentBlockType.CTAs]: INITIAL_CTAS_BLOCK_STATE,
	[ContentBlockType.Heading]: INITIAL_HEADING_BLOCK_STATE,
	[ContentBlockType.IFrame]: INITIAL_IFRAME_BLOCK_STATE,
	[ContentBlockType.ImageGrid]: INITIAL_IMAGE_GRID_BLOCK_STATE,
	[ContentBlockType.Image]: INITIAL_IMAGE_BLOCK_STATE,
	[ContentBlockType.Intro]: INITIAL_INTRO_BLOCK_STATE,
	[ContentBlockType.MediaPlayer]: INITIAL_MEDIA_PLAYER_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichTextTwoColumns]: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE,
	[ContentBlockType.RichText]: INITIAL_RICH_TEXT_BLOCK_STATE,
	[ContentBlockType.MediaPlayerTitleTextButton]: INITIAL_MEDIA_PLAYER_TITLE_TEXT_BUTTON_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichTextTwoColumns]: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE,
	[ContentBlockType.IFrame]: INITIAL_IFRAME_BLOCK_STATE,
	[ContentBlockType.Accordions]: INITIAL_ACCORDIONS_BLOCK_STATE,
	[ContentBlockType.Image]: INITIAL_IMAGE_BLOCK_STATE,
	[ContentBlockType.ImageGrid]: INITIAL_IMAGE_GRID_BLOCK_STATE,
	[ContentBlockType.PageOverview]: INITIAL_PAGE_OVERVIEW_BLOCK_STATE,
};

// Options
export const BACKGROUND_COLOR_OPTIONS: SelectOption<ContentBlockBackgroundColor>[] = [
	{
		label: 'Wit',
		value: ContentBlockBackgroundColor.White,
	},
	{
		label: 'Grijs',
		value: ContentBlockBackgroundColor.Gray50,
	},
	{
		label: 'Blauw',
		value: ContentBlockBackgroundColor.NightBlue,
	},
];

export const ALIGN_OPTIONS: { label: string; value: AlignOption }[] = [
	{ label: 'Links', value: 'left' },
	{ label: 'Gecentreerd', value: 'center' },
	{ label: 'Rechts', value: 'right' },
];

export const CONTENT_BLOCK_TYPE_OPTIONS: SelectOption[] = [
	{
		label: i18n.t('admin/content-block/content-block___kies-een-content-block'),
		value: '',
		disabled: true,
	},
	{
		label: i18n.t('admin/content-block/content-block___titel'),
		value: ContentBlockType.Heading,
	},
	{
		label: i18n.t('admin/content-block/content-block___tekst'),
		value: ContentBlockType.RichText,
	},
	{
		label: i18n.t('admin/content-block/content-block___tekst-2-kolommen'),
		value: ContentBlockType.RichTextTwoColumns,
	},
	{
		label: i18n.t('admin/content-block/content-block___knoppen'),
		value: ContentBlockType.Buttons,
	},
	{
		label: i18n.t('admin/content-block/content-block___intro'),
		value: ContentBlockType.Intro,
	},
	{
		label: i18n.t('admin/content-block/content-block___2-ct-as'),
		value: ContentBlockType.CTAs,
	},
	{
		label: i18n.t('admin/content-block/content-block___i-frame'),
		value: ContentBlockType.IFrame,
	},
	{
		label: i18n.t('admin/content-block/content-block___accordeons'),
		value: ContentBlockType.Accordions,
	},
	{
		label: i18n.t('Media-speler'),
		value: ContentBlockType.MediaPlayer,
	},
	{
		label: i18n.t('Media-speler met titel, tekst en knop'),
		value: ContentBlockType.MediaPlayerTitleTextButton,
	},
	{
		label: i18n.t('Afbeelding'),
		value: ContentBlockType.Image,
	},
	{
		label: i18n.t('Afbeelding grid'),
		value: ContentBlockType.ImageGrid,
	},
	{
		label: i18n.t('Pagina overzicht'),
		value: ContentBlockType.PageOverview,
	},
];

export const HEADING_LEVEL_OPTIONS: SelectOption<HeadingLevelOption>[] = [
	{ label: i18n.t('admin/content-block/content-block___h-2'), value: 'h2' },
	{ label: i18n.t('admin/content-block/content-block___h-3'), value: 'h3' },
	{ label: i18n.t('admin/content-block/content-block___h-4'), value: 'h4' },
];

export const BUTTON_TYPE_OPTIONS: SelectOption<ButtonTypeOption>[] = [
	{ label: i18n.t('admin/content-block/content-block___primair'), value: 'primary' },
	{ label: i18n.t('admin/content-block/content-block___secundair'), value: 'secondary' },
];

export const WIDTH_OPTIONS: SelectOption<WidthOption>[] = [
	{ label: i18n.t('Paginabreedte'), value: 'full-width' },
	{ label: i18n.t('Groot'), value: '500px' },
	{ label: i18n.t('Middelgroot'), value: '400px' },
];

export const IMAGE_GRID_FILL_OPTIONS: SelectOption<ImageGridFillOption>[] = [
	{ label: i18n.t('Opvullen'), value: 'cover' },
	{ label: i18n.t('Volledig zichtbaar'), value: 'contain' },
	{ label: i18n.t('Oorspronkelijke grootte'), value: 'auto' },
];

export const PAGE_OVERVIEW_TAB_STYLE_OPTIONS: SelectOption<ContentTabStyle>[] = [
	{ label: i18n.t('Menu balk'), value: 'MENU_BAR' },
	{ label: i18n.t('Tags'), value: 'ROUNDED_BADGES' },
];

export const PAGE_OVERVIEW_ITEM_STYLE_OPTIONS: SelectOption<ContentItemStyle>[] = [
	{ label: i18n.t('Lijst'), value: 'LIST' },
	{ label: i18n.t('Grid'), value: 'GRID' },
	{ label: i18n.t('Accrodions'), value: 'ACCORDION' },
];
