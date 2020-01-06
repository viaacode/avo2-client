export type ContentBlockStateType = 'components' | 'block';

export type ContentBlockStateOptions =
	| Partial<ContentBlockComponentState>
	| Partial<ContentBlockComponentState>[]
	| Partial<ContentBlockState>;

export type AlignOptions = 'left' | 'right' | 'center';

export type HeadingLevelOptions = 'h1' | 'h2' | 'h3' | 'h4';

// CONTENT BLOCK CONFIG
export interface ContentBlockConfig {
	name: string;
	components: ContentBlockComponentsConfig;
	block: ContentBlockBlockConfig;
}

export interface ContentBlockComponentsConfig {
	name?: string;
	state: ContentBlockComponentState | ContentBlockComponentState[];
	fields: {
		[key: string]: ContentBlockField;
	};
}

export interface ContentBlockBlockConfig {
	state: ContentBlockState;
	fields: {
		[key: string]: ContentBlockField;
	};
}

export type ContentBlockComponentState =
	| HeadingBlockComponentState
	| RichTextBlockComponentState
	| RichTextTwoColumnsBlockComponentState
	| ButtonsBlockComponentState
	| IntroBlockComponentState;

export type ContentBlockState =
	| HeadingBlockState
	| RichTextBlockState
	| RichTextTwoColumnsBlockState
	| ButtonsBlockState
	| IntroBlockState;

export interface ContentBlockField {
	label: string;
	editorType: ContentBlockEditor;
	editorProps?: any;
	validator?: (value: any) => string[];
}

export enum ContentBlockEditor {
	AlignSelect = 'AlignSelect',
	ColorSelect = 'ColorSelect',
	Select = 'Select',
	TextInput = 'TextInput',
	WYSIWYG = 'WYSIWYG',
}

// CONTENT BLOCKS
export interface DefaultContentBlock {
	backgroundColor: ContentBlockBackgroundColor;
	blockType: ContentBlockType;
}

export enum ContentBlockBackgroundColor {
	Gray50 = 'gray-50',
	White = 'white',
	NightBlue = 'night-blue',
}

export enum ContentBlockType {
	Buttons = 'Buttons',
	Heading = 'Heading',
	Intro = 'Intro',
	RichText = 'RichText',
	RichTextTwoColumns = 'RichTextTwoColumns',
}

export interface HeadingBlockState extends DefaultContentBlock {}

export interface RichTextBlockState extends DefaultContentBlock {}

export interface RichTextTwoColumnsBlockState extends DefaultContentBlock {}

export interface ButtonsBlockState extends DefaultContentBlock {}

export interface IntroBlockState extends DefaultContentBlock {}

export interface HeadingBlockComponentState {
	title: string;
	level: HeadingLevelOptions;
	align: AlignOptions;
}

export interface RichTextBlockComponentState {
	content: string;
}

export interface RichTextTwoColumnsBlockComponentState {
	firstColumnContent: string;
	secondColumnContent: string;
}

export interface ButtonsBlockComponentState {
	label: string;
}

export interface IntroBlockComponentState {
	title: string;
	text: string;
	align: AlignOptions;
}
