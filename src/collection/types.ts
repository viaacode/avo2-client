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

export type ContentBlockType =
	| 'Image'
	| 'ImageTitleTextButton'
	| 'Intro'
	| 'Links'
	| 'Quote'
	| 'RichText'
	| 'Subtitle'
	| 'Title'
	| 'TitleImageText'
	| 'Video'
	| 'VideoTitleTextButton';

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
