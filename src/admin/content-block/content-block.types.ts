export enum ContentBlockType {
	Heading = 'Heading',
	RichText = 'RichText',
}

export enum ContentBlockEditor {
	AlignSelect = 'AlignSelect',
	ColorSelect = 'ColorSelect',
	Select = 'Select',
	TextInput = 'TextInput',
	WYSIWYG = 'WYSIWYG',
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

export type Aligns = 'left' | 'right' | 'center';

// Heading block
export type HeadingLevels = 'h1' | 'h2' | 'h3' | 'h4';

export interface HeadingBlockFormState extends DefaultContentBlock {
	title: string;
	level: HeadingLevels;
	align: Aligns;
}

export interface RichTextBlockFormState extends DefaultContentBlock {
	text: string;
}

// General config
export type ContentBlockFormStates = HeadingBlockFormState | RichTextBlockFormState;
export type ContentBlockField = {
	label: string;
	editorType: ContentBlockEditor;
	editorProps?: any;
	validator?: (value: any) => string[];
};

export interface ContentBlockConfig {
	name: string;
	initialState: () => ContentBlockFormStates;
	fields: {
		[key: string]: ContentBlockField;
	};
}
