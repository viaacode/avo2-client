import { ButtonAction, IconName } from '@viaa/avo2-components';
// TODO: Import from components lib when exported there.
import { ButtonType } from '@viaa/avo2-components/dist/components/Button/Button.types';
import { GridItem } from '@viaa/avo2-components/dist/content-blocks/BlockGrid/BlockGrid';

export type ContentBlockStateType = 'components' | 'block';

export type ContentBlockStateOptions =
	| Partial<ContentBlockComponentState>
	| Partial<ContentBlockComponentState>[]
	| Partial<ContentBlockState>;

export type AlignOptions = 'left' | 'right' | 'center';

export type HeadingLevelOptions = 'h2' | 'h3' | 'h4';

export type ButtonTypeOptions = 'primary' | 'secondary';

export type WidthOptions = 'full-width' | '500px' | '400px';

export type ImageGridFillOptions = 'cover' | 'contain' | 'auto';

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
	| AccordionsBlockComponentState
	| ButtonsBlockComponentState
	| CTAsBlockComponentState
	| HeadingBlockComponentState
	| IFrameBlockComponentState
	| ImageBlockComponentState
	| ImageGridBlockComponentStateFields
	| IntroBlockComponentState
	| MediaPlayerBlockComponentState
	| RichTextBlockComponentState;

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
	ContentPicker = 'ContentPicker',
	FileUpload = 'FileUpload',
	IconPicker = 'IconPicker',
	MultiRange = 'MultiRange',
	Select = 'Select',
	TextInput = 'TextInput',
	WYSIWYG = 'WYSIWYG',
}

// If only one block exists then the errors are a string[]
// If multiple blocks exist then the errors are an array of string array indexed by their stateIndex
export type ContentBlockFormError = { [key: string]: string[] | string[][] };

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
	Accordions = 'ACCORDIONS',
	Buttons = 'BUTTONS',
	CTAs = 'CTAS',
	Heading = 'HEADING',
	IFrame = 'IFRAME',
	Image = 'IMAGE',
	ImageGrid = 'IMAGE_GRID',
	Intro = 'INTRO',
	MediaPlayer = 'MEDIA_PLAYER',
	MediaPlayerTitleTextButton = 'MEDIA_PLAYER_TITLE_TEXT_BUTTON',
	RichText = 'RICH_TEXT',
	RichTextTwoColumns = 'RICH_TEXT_TWO_COLUMNS',
}

export interface HeadingBlockComponentState {
	children: string;
	type: HeadingLevelOptions;
	align: AlignOptions;
}

export interface RichTextBlockComponentState {
	content: string;
}

export interface ImageBlockComponentState {
	title: string;
	text: string;
	source: string;
	width: WidthOptions;
}

export interface ImageGridBlockComponentStateFields {
	source: string;
	title?: string;
	text?: string;
	action?: ButtonAction;
}

export interface ImageGridBlockComponentStateBlockFields extends DefaultContentBlockState {
	elements: GridItem[];
	imageWidth?: number;
	imageHeight?: number;
	itemWidth?: number;
	fill?: ImageGridFillOptions;
	textAlign?: AlignOptions;
	className?: string;
	navigate?: (action: ButtonAction) => void;
}

export interface ButtonsBlockComponentState {
	label: string;
	icon?: IconName;
	type?: ButtonType;
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
	buttonLabel: string;
	buttonIcon?: IconName;
	buttonType?: ButtonType;
	buttonAction?: ButtonAction;
}

export interface IFrameBlockComponentState {
	title: string;
	src: string;
}

export interface AccordionsBlockComponentState {
	title: string;
	content: string;
}

export interface MediaPlayerBlockComponentState {
	title: string;
	item?: ButtonAction;
}

export interface MediaPlayerTitleTextButtonBlockComponentState {
	mediaTitle: string;
	mediaItem?: ButtonAction;
	headingType: HeadingLevelOptions;
	headingTitle: string;
	content: string;
	buttonLabel: string;
	buttonIcon?: IconName;
	buttonType?: ButtonType;
	buttonAction?: ButtonAction;
	align: AlignOptions;
}
