import {
	BlockImageProps,
	BlockImageTitleTextButtonProps,
	BlockIntroProps,
	BlockLinksProps,
	BlockQuoteProps,
	BlockSubtitleProps,
	BlockTextProps,
	BlockTitleImageTextProps,
	BlockTitleProps,
	BlockVideoProps,
	BlockVideoTitleTextButtonProps,
} from '@viaa/avo2-components';
import { ContentType } from '@viaa/avo2-components/dist/types';

export enum ContentBlockType {
	'Image',
	'ImageTitleTextButton',
	'Intro',
	'Links',
	'Quote',
	'RichText',
	'Subtitle',
	'Title',
	'TitleImageText',
	'Video',
	'VideoTitleTextButton',
}

export type ContentBlockMetaData =
	| BlockImageProps
	| BlockImageTitleTextButtonProps
	| BlockIntroProps
	| BlockLinksProps
	| BlockQuoteProps
	| BlockTextProps
	| BlockSubtitleProps
	| BlockTitleProps
	| BlockTitleImageTextProps
	| BlockVideoProps
	| BlockVideoTitleTextButtonProps;

export interface ContentBlockInfo {
	blockType: ContentBlockType;
	content: ContentBlockMetaData;
}

export enum ContentTypeNumber {
	audio = 1,
	video = 2,
	collection = 3,
	bundle = 4,
}

export enum ContentTypeString {
	audio = 'audio',
	video = 'video',
	collection = 'collectie',
	bundle = 'bundel',
}

export type DutchContentType = 'audio' | 'video' | 'collectie' | 'bundel' | 'zoek';

export function dutchContentLabelToEnglishLabel(label: DutchContentType): ContentType {
	return {
		audio: 'audio',
		video: 'video',
		collectie: 'collection',
		bundel: 'bundle',
		zoek: 'search',
	}[label] as ContentType;
}
