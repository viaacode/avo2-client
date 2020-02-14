import { Select, SelectOption, TextInput, WYSIWYG } from '@viaa/avo2-components';

import { IconPicker } from '../../admin/shared/components';
import i18n from '../../shared/translations/i18n';

import { ContentPicker } from '../shared/components';

import { AlignSelect, ColorSelect } from './components';
import {
	AlignOptions,
	ButtonTypeOptions,
	ContentBlockBackgroundColor,
	ContentBlockType,
	HeadingLevelOptions,
} from './content-block.types';
import {
	ACCORDIONS_BLOCK_CONFIG,
	BUTTONS_BLOCK_CONFIG,
	CTAS_BLOCK_CONFIG,
	HEADING_BLOCK_CONFIG,
	IFRAME_BLOCK_CONFIG,
	INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES,
	INITIAL_BUTTONS_BLOCK_COMPONENT_STATES,
	INITIAL_CTAS_BLOCK_COMPONENT_STATES,
	INITIAL_HEADING_BLOCK_COMPONENT_STATE,
	INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
	INITIAL_INTRO_BLOCK_COMPONENT_STATE,
	INITIAL_MEDIA_PLAYER_BLOCK_COMPONENT_STATE,
	INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE,
	INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE,
	INTRO_BLOCK_CONFIG,
	MEDIA_PLAYER_BLOCK_CONFIG,
	RICH_TEXT_BLOCK_CONFIG,
	RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
} from './helpers';

export const CONTENT_BLOCKS_RESULT_PATH = {
	GET: 'app_content_blocks',
	INSERT: 'insert_app_content_blocks',
};

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

export const ALIGN_OPTIONS: { label: string; value: AlignOptions }[] = [
	{
		label: 'Links',
		value: 'left',
	},
	{
		label: 'Gecentreerd',
		value: 'center',
	},
	{
		label: 'Rechts',
		value: 'right',
	},
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
];

export const EDITOR_TYPES_MAP = {
	AlignSelect,
	ColorSelect,
	Select,
	TextInput,
	WYSIWYG,
	IconPicker,
	ContentPicker,
};

export const CONTENT_BLOCK_CONFIG_MAP = {
	[ContentBlockType.Accordions]: ACCORDIONS_BLOCK_CONFIG,
	[ContentBlockType.CTAs]: CTAS_BLOCK_CONFIG,
	[ContentBlockType.Buttons]: BUTTONS_BLOCK_CONFIG,
	[ContentBlockType.Heading]: HEADING_BLOCK_CONFIG,
	[ContentBlockType.IFrame]: IFRAME_BLOCK_CONFIG,
	[ContentBlockType.Intro]: INTRO_BLOCK_CONFIG,
	[ContentBlockType.MediaPlayer]: MEDIA_PLAYER_BLOCK_CONFIG,
	[ContentBlockType.RichText]: RICH_TEXT_BLOCK_CONFIG,
	[ContentBlockType.RichTextTwoColumns]: RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
};

export const CONTENT_BLOCK_INITIAL_STATE_MAP = {
	[ContentBlockType.Accordions]: INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Buttons]: INITIAL_BUTTONS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.CTAs]: INITIAL_CTAS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Heading]: INITIAL_HEADING_BLOCK_COMPONENT_STATE,
	[ContentBlockType.IFrame]: INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
	[ContentBlockType.Intro]: INITIAL_INTRO_BLOCK_COMPONENT_STATE,
	[ContentBlockType.MediaPlayer]: INITIAL_MEDIA_PLAYER_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichText]: INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichTextTwoColumns]: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE,
};

// Options
export const HEADING_LEVEL_OPTIONS: SelectOption<HeadingLevelOptions>[] = [
	{
		label: i18n.t('admin/content-block/content-block___h-2'),
		value: 'h2',
	},
	{
		label: i18n.t('admin/content-block/content-block___h-3'),
		value: 'h3',
	},
	{
		label: i18n.t('admin/content-block/content-block___h-4'),
		value: 'h4',
	},
];

export const BUTTON_TYPE_OPTIONS: SelectOption<ButtonTypeOptions>[] = [
	{
		label: i18n.t('admin/content-block/content-block___primair'),
		value: 'primary',
	},
	{
		label: i18n.t('admin/content-block/content-block___secundair'),
		value: 'secondary',
	},
];
