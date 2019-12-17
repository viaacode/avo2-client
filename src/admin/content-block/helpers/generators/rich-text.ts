import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	RichTextBlockFormState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS } from './defaults';

export const INITIAL_RICH_TEXT_BLOCK_STATE = (): RichTextBlockFormState => ({
	text: '',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.RichText),
});

export const RICH_TEXT_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Tekst',
	initialState: INITIAL_RICH_TEXT_BLOCK_STATE,
	fields: {
		content: {
			label: 'Tekst',
			editorType: ContentBlockEditor.WYSIWYG,
			editorProps: {
				id: 'rte',
			},
			validator: (value: string) => {
				const errorArray: string[] = [];

				if (!!value) {
					errorArray.push('Tekst is verplicht');
				}

				return errorArray;
			},
		},
		...CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
