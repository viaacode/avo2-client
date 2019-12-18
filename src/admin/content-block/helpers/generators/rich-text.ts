import { isEmpty, isNil } from 'lodash-es';

import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	RichTextBlockFormState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS } from './defaults';

export const INITIAL_RICH_TEXT_BLOCK_STATE = (): RichTextBlockFormState => ({
	content: '',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.RichText),
});

export const RICH_TEXT_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Tekst',
	formState: INITIAL_RICH_TEXT_BLOCK_STATE(),
	fields: {
		content: {
			label: 'Tekst',
			editorType: ContentBlockEditor.WYSIWYG,
			validator: (value: string) => {
				const errorArray: string[] = [];

				if (isNil(value) || isEmpty(value)) {
					errorArray.push('Tekst is verplicht');
				}

				return errorArray;
			},
		},
		...CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
