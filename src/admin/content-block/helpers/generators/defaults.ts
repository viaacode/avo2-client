import { ContentBlockBackgroundColor, ContentBlockType } from '../../content-block.types';

export const CONTENT_BLOCK_DEFAULTS = (
	backgroundColor: ContentBlockBackgroundColor,
	blockType: ContentBlockType
) => ({
	backgroundColor,
	blockType,
});
