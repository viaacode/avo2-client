import i18n from '../../../../shared/translations/i18n';

import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockType,
	DefaultContentBlockState,
	RichTextBlockComponentState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE = (): RichTextBlockComponentState => ({
	content: '',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.RichText),
});

export const INITIAL_RICH_TEXT_BLOCK_STATE = (): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.RichText);

export const RICH_TEXT_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/rich-text___tekst'),
	components: {
		state: INITIAL_RICH_TEXT_BLOCK_COMPONENT_STATE(),
		fields: {
			content: TEXT_FIELD(),
		},
	},
	block: {
		state: INITIAL_RICH_TEXT_BLOCK_STATE(),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
