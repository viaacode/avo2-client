import { OptionsType } from 'react-select';

import { IconName, Select, SelectOption, TextInput, WYSIWYG } from '@viaa/avo2-components';

import { IconPicker } from '../../admin/shared/components';
import i18n from '../../shared/translations/i18n';
import { ReactSelectOption } from '../../shared/types';
// TODO: Move to shared components folder for admin.
import { ContentPicker } from '../content/components/ContentPicker/ContentPicker';

import { AlignSelect, ColorSelect } from './components';
import {
	AlignOptions,
	ButtonTypeOptions,
	ContentBlockBackgroundColor,
	ContentBlockType,
	HeadingLevelOptions,
} from './content-block.types';
import {
	BUTTONS_BLOCK_CONFIG,
	CTAS_BLOCK_CONFIG,
	HEADING_BLOCK_CONFIG,
	IFRAME_BLOCK_CONFIG,
	INITIAL_BUTTONS_BLOCK_COMPONENT_STATES,
	INITIAL_CTAS_BLOCK_COMPONENT_STATES,
	INITIAL_HEADING_BLOCK_COMPONENT_STATE,
	INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
	INITIAL_INTRO_BLOCK_COMPONENT_STATE,
	INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE,
	INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE,
	INTRO_BLOCK_CONFIG,
	RICH_TEXT_BLOCK_CONFIG,
	RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
} from './helpers';

export const CONTENT_BLOCKS_RESULT_PATH = {
	GET: 'app_content_blocks',
	INSERT: 'insert_app_content_blocks',
};

export const BACKGROUND_COLOR_OPTIONS: SelectOption<ContentBlockBackgroundColor>[] = [
	{ label: 'Wit', value: ContentBlockBackgroundColor.White },
	{ label: 'Grijs', value: ContentBlockBackgroundColor.Gray50 },
	{ label: 'Blauw', value: ContentBlockBackgroundColor.NightBlue },
];

export const ALIGN_OPTIONS: { label: string; value: AlignOptions }[] = [
	{ label: 'Links', value: 'left' },
	{ label: 'Gecentreerd', value: 'center' },
	{ label: 'Rechts', value: 'right' },
];

export const CONTENT_BLOCK_TYPE_OPTIONS: SelectOption[] = [
	{ label: 'Kies een content block', value: '', disabled: true },
	{ label: 'Titel', value: ContentBlockType.Heading },
	{ label: 'Tekst', value: ContentBlockType.RichText },
	{ label: 'Tekst (2 kolommen)', value: ContentBlockType.RichTextTwoColumns },
	{ label: 'Knoppen', value: ContentBlockType.Buttons },
	{ label: 'Intro', value: ContentBlockType.Intro },
	{ label: '2 CTAs', value: ContentBlockType.CTAs },
	{ label: 'IFrame', value: ContentBlockType.IFrame },
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
	[ContentBlockType.CTAs]: CTAS_BLOCK_CONFIG,
	[ContentBlockType.Buttons]: BUTTONS_BLOCK_CONFIG,
	[ContentBlockType.Heading]: HEADING_BLOCK_CONFIG,
	[ContentBlockType.Intro]: INTRO_BLOCK_CONFIG,
	[ContentBlockType.RichText]: RICH_TEXT_BLOCK_CONFIG,
	[ContentBlockType.RichTextTwoColumns]: RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
	[ContentBlockType.IFrame]: IFRAME_BLOCK_CONFIG,
};

export const CONTENT_BLOCK_INITIAL_STATE_MAP = {
	[ContentBlockType.CTAs]: INITIAL_CTAS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Buttons]: INITIAL_BUTTONS_BLOCK_COMPONENT_STATES,
	[ContentBlockType.Heading]: INITIAL_HEADING_BLOCK_COMPONENT_STATE,
	[ContentBlockType.Intro]: INITIAL_INTRO_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichText]: INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE,
	[ContentBlockType.RichTextTwoColumns]: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE,
	[ContentBlockType.IFrame]: INITIAL_IFRAME_BLOCK_COMPONENT_STATE,
};

// Options
export const HEADING_LEVEL_OPTIONS: SelectOption<HeadingLevelOptions>[] = [
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
];

export const CTA_ICON_OPTIONS: OptionsType<ReactSelectOption<IconName>> = Object.freeze([
	{ label: i18n.t('admin/menu/menu___aktetas'), value: 'briefcase' },
	// TODO: Fix icon list
]);

export const BUTTON_TYPE_OPTIONS: SelectOption<ButtonTypeOptions>[] = [
	{ label: i18n.t('Primair'), value: 'primary' },
	{ label: i18n.t('Secundair'), value: 'secondary' },
];
