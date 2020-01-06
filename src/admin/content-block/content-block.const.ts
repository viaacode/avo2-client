import { Select, SelectOption, TextInput, WYSIWYG } from '@viaa/avo2-components';

import { AlignSelect, ColorSelect } from './components';
import {
	Aligns,
	ContentBlockBackgroundColor,
	ContentBlockType,
	HeadingLevels,
} from './content-block.types';
import {
	HEADING_BLOCK_CONFIG,
	RICH_TEXT_BLOCK_CONFIG,
	RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
} from './helpers';

export const BACKGROUND_COLOR_OPTIONS: SelectOption<ContentBlockBackgroundColor>[] = [
	{ label: 'Wit', value: ContentBlockBackgroundColor.White },
	{ label: 'Grijs', value: ContentBlockBackgroundColor.Gray50 },
	{ label: 'Blauw', value: ContentBlockBackgroundColor.NightBlue },
];

export const ALIGN_OPTIONS: { label: string; value: Aligns }[] = [
	{ label: 'Links', value: 'left' },
	{ label: 'Gecentreerd', value: 'center' },
	{ label: 'Rechts', value: 'right' },
];

export const CONTENT_BLOCK_TYPE_OPTIONS: SelectOption[] = [
	{ label: 'Kies een content block', value: '', disabled: true },
	{ label: 'Titel', value: ContentBlockType.Heading },
	{ label: 'Tekst (wysiwyg)', value: ContentBlockType.RichText },
	{ label: 'Tekst 2 kolommen (wysiwyg)', value: ContentBlockType.RichTextTwoCols },
];

export const EDITOR_TYPES_MAP = {
	AlignSelect,
	ColorSelect,
	Select,
	TextInput,
	WYSIWYG,
};

export const CONTENT_BLOCK_CONFIG_MAP = {
	[ContentBlockType.Heading]: HEADING_BLOCK_CONFIG,
	[ContentBlockType.RichText]: RICH_TEXT_BLOCK_CONFIG,
	[ContentBlockType.RichTextTwoCols]: RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG,
};

// Heading
export const HEADING_LEVEL_OPTIONS: SelectOption<HeadingLevels>[] = [
	{ label: 'H1', value: 'h1' },
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
];
