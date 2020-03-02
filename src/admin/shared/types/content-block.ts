import {
	ButtonAction,
	ButtonType,
	ContentItemStyle,
	ContentTabStyle,
	IconName,
} from '@viaa/avo2-components';
import { GridItem } from '@viaa/avo2-components/dist/content-blocks/BlockGrid/BlockGrid'; // TODO: import from components library when exported.
import { Avo } from '@viaa/avo2-types';

import { ContentPageType } from '../../content/content.types';

// OPTIONS
export type AlignOption = 'left' | 'right' | 'center';

export type FillOption = 'cover' | 'contain' | 'auto';

export type WidthOption = 'full-width' | '500px' | '400px';

export type HeadingTypeOption = 'h2' | 'h3' | 'h4';

export type ContentBlockStateOptions =
	| Partial<ContentBlockComponentState>
	| Partial<ContentBlockComponentState>[]
	| Partial<ContentBlockState>;

export type ButtonTypeOption =
	| 'borderless-i'
	| 'borderless'
	| 'danger-hover'
	| 'danger'
	| 'link'
	| 'inline-link'
	| 'primary'
	| 'secondary-i'
	| 'secondary'
	| 'tertiary';

export enum BackgroundColorOption {
	Gray50 = 'gray-50',
	White = 'white',
	NightBlue = 'night-blue',
	Teal = 'teal',
	TealBright = 'teal-bright',
	SoftBlue = 'soft-blue',
	OceanGreen = 'ocean-green',
}

// CONTENT BLOCK CONFIG
export interface ContentBlockMeta {
	index: number;
	config: ContentBlockConfig;
}

// CONTENT BLOCK
export interface ContentBlockConfig {
	id?: number;
	name: string;
	components: ContentBlockComponentsConfig;
	block: ContentBlockBlockConfig;
	type: ContentBlockType;
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

export interface ContentBlockField {
	label?: string; // Optional for checkboxes, who have their own label
	editorType: ContentBlockEditor;
	editorProps?: any;
	validator?: (value: any) => string[];
}

// must match the lookup enumeration `content_block_types` on GraphQL.
export enum ContentBlockType {
	Accordions = 'ACCORDIONS',
	Buttons = 'BUTTONS',
	CTAs = 'CTAS',
	Heading = 'HEADING',
	IFrame = 'IFRAME',
	Image = 'IMAGE',
	ImageGrid = 'IMAGE_GRID',
	Intro = 'INTRO',
	MediaGrid = 'MEDIA_GRID',
	MediaPlayer = 'MEDIA_PLAYER',
	MediaPlayerTitleTextButton = 'MEDIA_PLAYER_TITLE_TEXT_BUTTON',
	RichText = 'RICH_TEXT',
	RichTextTwoColumns = 'RICH_TEXT_TWO_COLUMNS',
	PageOverview = 'PAGE_OVERVIEW',
	ProjectsSpotlight = 'PROJECTS_SPOTLIGHT',
}

// if 1 block, errors is a string[]. If multiple, it is a string[] index by their stateIndex, so string[][].
export type ContentBlockFormError = { [key: string]: string[] | string[][] };

/* CONTENT BLOCK STATE */
export interface DefaultContentBlockState {
	backgroundColor: BackgroundColorOption;
	blockType: ContentBlockType;
	position: number;
}

export type ContentBlockState = DefaultContentBlockState;

export type ContentBlockStateType = 'components' | 'block';

export type ContentBlockStateOption =
	| Partial<ContentBlockComponentState>
	| Partial<ContentBlockComponentState>[]
	| Partial<ContentBlockState>;

/* CONTENT BLOCK EDITOR */
export enum ContentBlockEditor {
	AlignSelect = 'AlignSelect',
	Checkbox = 'Checkbox',
	ColorSelect = 'ColorSelect',
	ContentPicker = 'ContentPicker',
	ContentTypeAndLabelsPicker = 'ContentTypeAndLabelsPicker',
	FileUpload = 'FileUpload',
	IconPicker = 'IconPicker',
	MultiRange = 'MultiRange',
	Select = 'Select',
	TextArea = 'TextArea',
	TextInput = 'TextInput',
	WYSIWYG = 'WYSIWYG',
}

/* CONTENT BLOCKS */
export type ContentBlockComponentState =
	| AccordionsBlockComponentState
	| ButtonsBlockComponentState
	| CTAsBlockComponentState
	| HeadingBlockComponentState
	| IFrameBlockComponentState
	| ImageBlockComponentState
	| ImageGridBlockComponentStateFields
	| IntroBlockComponentState
	| MediaGridBlockComponentState
	| MediaPlayerBlockComponentState
	| PageOverviewBlockComponentStateFields
	| RichTextBlockComponentState;

export interface HeadingBlockComponentState {
	children: string;
	type: HeadingTypeOption;
	align: AlignOption;
}

export interface RichTextBlockComponentState {
	content: string;
}

export interface ImageBlockComponentState {
	title: string;
	text: string;
	source: string;
	width: WidthOption;
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
	fill?: FillOption;
	textAlign?: AlignOption;
	className?: string;
	navigate?: (action: ButtonAction) => void;
}

export interface PageOverviewBlockComponentStateFields {
	tabs?: string[];
	tabStyle?: ContentTabStyle;
	allowMultiple?: boolean;
	contentType: ContentPageType;
	itemStyle?: ContentItemStyle;
	showTitle?: boolean;
	showDescription?: boolean;
	showDate?: boolean;
	buttonLabel?: string;
	itemsPerPage?: number;
	navigate?: () => void;
}

export interface ButtonsBlockComponentState {
	label: string;
	icon?: IconName;
	type?: ButtonType;
	navigate?: () => void;
}

export interface IntroBlockComponentState {
	title: string;
	content: string;
	align: AlignOption;
}

export interface CTAsBlockComponentState {
	heading: string;
	headingType: HeadingTypeOption;
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
	headingType: HeadingTypeOption;
	headingTitle: string;
	content: string;
	buttonLabel: string;
	buttonIcon?: IconName;
	buttonType?: ButtonType;
	buttonAction?: ButtonAction;
	align: AlignOption;
}

export interface MediaGridBlockComponentState {
	mediaItem?: ButtonAction;
}

export interface MediaGridBlockState extends DefaultContentBlockState {
	ctaTitle?: string;
	ctaContent?: string;
	ctaButtonLabel?: string;
	ctaButtonAction?: ButtonAction;
	searchQuery?: ButtonAction;
	searchQueryLimit: string;
}

export interface MediaItemResponse {
	tileData: Partial<Avo.Collection.Collection | Avo.Item.Item>;
	count: number;
}
