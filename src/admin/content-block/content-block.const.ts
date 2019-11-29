import { ContentBlockBackgroundColor, HeadingAligns, HeadingLevels } from './content-block.types';

export const BACKGROUND_COLOR_OPTIONS: { label: string; value: ContentBlockBackgroundColor }[] = [
	{ label: 'Grijs', value: ContentBlockBackgroundColor.Gray50 },
	{ label: 'Wit', value: ContentBlockBackgroundColor.White },
	{ label: 'Groen', value: ContentBlockBackgroundColor.OceanGreen },
	{ label: 'Lichtblauw', value: ContentBlockBackgroundColor.SoftBlue },
	{ label: 'Blauw', value: ContentBlockBackgroundColor.TealBright },
];

// Heading
export const HEADING_ALIGN_OPTIONS: { label: string; value: HeadingAligns }[] = [
	{ label: 'links', value: 'left' },
	{ label: 'links', value: 'right' },
	{ label: 'links', value: 'center' },
];
export const HEADING_LEVEL_OPTIONS: { label: string; value: HeadingLevels }[] = [
	{ label: 'Hoofding 1', value: 'h1' },
	{ label: 'Hoofding 2', value: 'h2' },
	{ label: 'Hoofding 3', value: 'h3' },
	{ label: 'Hoofding 4', value: 'h4' },
];
