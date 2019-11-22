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
import { Avo } from '@viaa/avo2-types';

import { IconName, ValueOf } from '../shared/types/types';

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
	item = 'item',
	audio = 'audio',
	video = 'video',
	collection = 'collectie',
	bundle = 'bundel',
	searchquery = 'zoekopdracht',
}

export type DutchContentType = 'item' | 'audio' | 'video' | 'collectie' | 'bundel' | 'zoekopdracht';

export function toEnglishContentType(label: DutchContentType): ContentType {
	return {
		item: 'item',
		audio: 'audio',
		video: 'video',
		collectie: 'collection',
		bundel: 'bundle',
		zoek: 'search',
		zoekopdracht: 'searchquery',
	}[label] as ContentType;
}

export interface Tab {
	id: string;
	label: string;
	icon: IconName;
}

export interface FragmentPropertyUpdateInfo {
	value: Partial<ValueOf<Avo.Collection.Fragment>>;
	fieldName: keyof Avo.Collection.Fragment;
	fragmentId: number;
}
