// TODO: remove with typings 2.8.x update in favour of Avo.ContentBlock.ContentBlock
export type ContentBlockSchema = {
	id: number;
	content_id: number;
	variables: { [key: string]: any } | any[] | null;
	position: number | null;
	created_at: string;
	updated_at: string;
	content_block_type: string;
};

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
	| RichTextTwoColumnsBlockComponentState
	| ButtonsBlockComponentState
	| IntroBlockComponentState
	| CTAsBlockComponentState;

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
}

export interface HeadingBlockComponentState {
	children: string;
	type: HeadingLevelOptions;
	// TODO: align: AlignOptions;
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

export interface CTAsBlockComponentState {
	heading: string;
	headingType: HeadingLevelOptions;
	content: string | string[];
	// TODO: button: Partial<ButtonsBlockComponentState>;
}
