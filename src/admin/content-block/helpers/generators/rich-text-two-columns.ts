import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockType,
	RichTextTwoColumnsBlockComponentState,
	RichTextTwoColumnsBlockState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE = (): RichTextTwoColumnsBlockComponentState => ({
	firstColumnContent: '',
	secondColumnContent: '',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.RichTextTwoColumns),
});

export const INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE = (): RichTextTwoColumnsBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.RichTextTwoColumns);

export const RICH_TEXT_TWO_COLUMNS_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Tekst (2 kolommen)',
	components: {
		state: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_COMPONENT_STATE(),
		fields: {
			firstColumnContent: TEXT_FIELD('Kolom 1 tekstveld moet verplicht ingevuld zijn.', {
				label: 'Kolom 1',
			}),
			secondColumnContent: TEXT_FIELD('Kolom 2 tekstveld moet verplicht ingevuld zijn.', {
				label: 'Kolom 2',
			}),
		},
	},
	block: {
		state: INITIAL_RICH_TEXT_TWO_COLUMNS_BLOCK_STATE(),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
