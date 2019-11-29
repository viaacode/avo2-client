export enum ContentBlockType {
	'Heading',
}

export enum ContentBlockBackgroundColor {
	Gray50 = 'gray-50',
	White = 'white',
	OceanGreen = 'ocean-green',
	SoftBlue = 'soft-blue',
	TealBright = 'teal-bright',
}

export interface DefaultContentBlock {
	backgroundColor: ContentBlockBackgroundColor;
	blockType: ContentBlockType;
}

// Heading block
export type HeadingAligns = 'left' | 'right' | 'center';
export type HeadingLevels = 'h1' | 'h2' | 'h3' | 'h4';

export interface HeadingBlockFormState extends DefaultContentBlock {
	title: string;
	level: HeadingLevels;
	align: HeadingAligns;
}
