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

export type HeadingLevelOptions = 'h1' | 'h2' | 'h3' | 'h4';

// CONTENT BLOCK CONFIG
export interface ContentBlockMeta {
	index: number;
	config: ContentBlockConfig;
}

export interface ContentBlockConfig {
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
	| IntroBlockComponentState;

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

// CONTENT BLOCKS
export interface DefaultContentBlockState {
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
