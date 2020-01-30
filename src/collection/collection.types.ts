import {
	BlockImageProps,
	BlockImageTitleTextButtonProps,
	BlockIntroProps,
	BlockLinksProps,
	BlockQuoteProps,
	BlockTitleImageTextProps,
	BlockVideoProps,
	BlockVideoTitleTextButtonProps,
	DutchContentType,
	EnglishContentType,
} from '@viaa/avo2-components';

export type CollectionOverviewTableColumns =
	| 'thumbnail'
	| 'title'
	| 'updated_at'
	| 'inFolder'
	| 'access'
	| 'actions';

export enum ContentBlockType {
	'Image',
	'ImageTitleTextButton',
	'Intro',
	'Links',
	'Quote',
	'RichText',
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
	item = 'item',
	audio = 'audio',
	video = 'video',
	collection = 'collectie',
	bundle = 'bundel',
	searchquery = 'zoekopdracht',
}

export function toEnglishContentType(label: DutchContentType): EnglishContentType {
	return {
		item: 'item',
		audio: 'audio',
		video: 'video',
		collectie: 'collection',
		bundel: 'bundle',
		zoek: 'search',
		zoekopdracht: 'searchquery',
	}[label] as EnglishContentType;
}
