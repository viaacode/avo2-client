import {
	ContentBlockBackgroundColor,
	ContentBlockType,
	HeadingBlockFormState,
} from '../../content-block.types';
import { CONTENT_BLOCK_DEFAULTS } from './defaults';

export const INITIAL_HEADING_BLOCK = (): HeadingBlockFormState => ({
	title: '',
	level: 'h1',
	align: 'left',
	...CONTENT_BLOCK_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Heading),
});
