export type ContentBlockStateType = 'components' | 'block';

export type ContentBlockStateOptions =
	| Partial<ContentBlockComponentState>
	| Partial<ContentBlockComponentState>[]
	| Partial<ContentBlockState>;

export type AlignOptions = 'left' | 'right' | 'center';

export type HeadingLevelOptions = 'h2' | 'h3' | 'h4';

// CONTENT BLOCK CONFIG
export interface ContentBlockMeta {
	index: number;
	config: ContentBlockConfig;
}

export interface ContentBlockConfig {
	id?: number;
	name: string;
	components: ContentBlockComponentsConfig;
	block: ContentBlockBlockConfig;
}

export interface ContentBlockComponentsConfig {
	name?: string;
	limits?: ContentBlockComponentsLimits;
	state: ContentBlockComponentState | ContentBlockComponentState[];
	fields: {
		[key: string]: ContentBlockField;
	};
}

export interface ContentBlockComponentsLimits {
	min?: number;
	max?: number;
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
	| ButtonsBlockComponentState
	| IntroBlockComponentState
	| CTAsBlockComponentState
	| IFrameBlockComponentState;

export type ContentBlockState = DefaultContentBlockState;

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

export interface ContentBlockFormError {
	[key: string]: string[];
}

// CONTENT BLOCKS
export interface DefaultContentBlockState {
	backgroundColor: ContentBlockBackgroundColor;
	blockType: ContentBlockType;
	position: number;
}

export enum ContentBlockBackgroundColor {
	Gray50 = 'gray-50',
	White = 'white',
	NightBlue = 'night-blue',
}

// These match the content_block_types enums from graphql
// New values need to be added there as well or it won't save
export enum ContentBlockType {
	Buttons = 'BUTTONS',
	Heading = 'HEADING',
	CTAs = 'CTAS',
	Intro = 'INTRO',
	RichText = 'RICH_TEXT',
	RichTextTwoColumns = 'RICH_TEXT_TWO_COLUMNS',
	IFrame = 'IFRAME',
}

export interface HeadingBlockComponentState {
	children: string;
	type: HeadingLevelOptions;
	align: AlignOptions;
}

export interface RichTextBlockComponentState {
	content: string;
}

export interface ButtonsBlockComponentState {
	label: string;
	// TODO: button actions;
}

export interface IntroBlockComponentState {
	title: string;
	content: string;
	align: AlignOptions;
}

export interface CTAsBlockComponentState {
	heading: string;
	headingType: HeadingLevelOptions;
	content: string | string[];
	// TODO: button: Partial<ButtonsBlockComponentState>;
}

export interface IFrameBlockComponentState {
	title: string;
	src: string;
}
