import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockType,
	RichTextBlockFormState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_RICH_TEXT_BLOCK_STATE = (): RichTextBlockFormState => ({
	content: '',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.RichText),
});

export const RICH_TEXT_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Tekst',
	formState: INITIAL_RICH_TEXT_BLOCK_STATE(),
	fields: {
		content: TEXT_FIELD(),
		...CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
