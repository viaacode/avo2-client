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

// Content block
export enum ContentBlockType {
	Heading = 'HEADING',
	RichText = 'RICH_TEXT',
	RichTextTwoColumns = 'RICH_TEXT_TWO_COLUMNS',
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
	NightBlue = 'night-blue',
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

// Rich text block
export interface RichTextBlockFormState extends DefaultContentBlock {
	content: string;
}

export interface RichTextTwoColumnsBlockFormState extends DefaultContentBlock {
	firstColumnContent: string;
	secondColumnContent: string;
}

// General config
export type ContentBlockFormStates =
	| HeadingBlockFormState
	| RichTextBlockFormState
	| RichTextTwoColumnsBlockFormState;

export type ContentBlockField = {
	label: string;
	editorType: ContentBlockEditor;
	editorProps?: any;
	validator?: (value: any) => string[];
};

export interface ContentBlockConfig {
	name: string;
	formState: ContentBlockFormStates;
	fields: {
		[key: string]: ContentBlockField;
	};
}
