import { isEmpty, isNil } from 'lodash-es';

import { HEADING_LEVEL_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	HeadingBlockFormState,
} from '../../content-block.types';
import { ALIGN_FIELD, CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS } from './defaults';

export const INITIAL_HEADING_BLOCK_STATE = (): HeadingBlockFormState => ({
	title: '',
	level: 'h1',
	align: 'left',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Heading),
});

export const HEADING_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Titel',
	formState: INITIAL_HEADING_BLOCK_STATE(),
	fields: {
		title: {
			label: 'Titel',
			editorType: ContentBlockEditor.TextInput,
			validator: (value: string) => {
				const errorArray: string[] = [];

				if (isNil(value) || isEmpty(value)) {
					errorArray.push('Titel is verplicht');
				}

				return errorArray;
			},
		},
		level: {
			label: 'Stijl',
			editorType: ContentBlockEditor.Select,
			editorProps: {
				options: HEADING_LEVEL_OPTIONS,
			},
		},
		align: ALIGN_FIELD(),
		...CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
