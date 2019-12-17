import { Select, SelectOption, TextInput, WYSIWYG } from '@viaa/avo2-components';

import { AlignSelect, ColorSelect } from './components';
import {
	Aligns,
	ContentBlockBackgroundColor,
	ContentBlockType,
	HeadingLevels,
} from './content-block.types';
import { HEADING_BLOCK_CONFIG, RICH_TEXT_BLOCK_CONFIG } from './helpers';

export const BACKGROUND_COLOR_OPTIONS: SelectOption<ContentBlockBackgroundColor>[] = [
	{ label: 'Wit', value: ContentBlockBackgroundColor.White },
	{ label: 'Grijs', value: ContentBlockBackgroundColor.Gray50 },
	{ label: 'Groen', value: ContentBlockBackgroundColor.OceanGreen },
	{ label: 'Lichtblauw', value: ContentBlockBackgroundColor.SoftBlue },
	{ label: 'Blauw', value: ContentBlockBackgroundColor.TealBright },
];

export const ALIGN_OPTIONS: { label: string; value: Aligns }[] = [
	{ label: 'Links', value: 'left' },
	{ label: 'Gecentreerd', value: 'center' },
	{ label: 'Rechts', value: 'right' },
];

export const CONTENT_BLOCK_TYPE_OPTIONS: SelectOption<string>[] = [
	{ label: 'Kies een content block', value: '', disabled: true },
	{ label: 'Hoofding', value: ContentBlockType.Heading },
	{ label: 'Tekst (wysiwyg)', value: ContentBlockType.RichText },
];

export const EDITOR_TYPES_MAP = {
	AlignSelect,
	ColorSelect,
	Select,
	TextInput,
	WYSIWYG,
};

export const CONTENT_BLOCK_CONFIG_MAP = {
	Heading: HEADING_BLOCK_CONFIG,
	RichText: RICH_TEXT_BLOCK_CONFIG,
};

// Heading
export const HEADING_LEVEL_OPTIONS: SelectOption<HeadingLevels>[] = [
	{ label: 'H1', value: 'h1' },
	{ label: 'H2', value: 'h2' },
	{ label: 'H3', value: 'h3' },
	{ label: 'H4', value: 'h4' },
];
