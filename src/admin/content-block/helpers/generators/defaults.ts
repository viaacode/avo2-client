import { isEmpty, isNil, kebabCase } from 'lodash-es';

import { ALIGN_OPTIONS, BACKGROUND_COLOR_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockEditor,
	ContentBlockType,
} from '../../content-block.types';

export const FORM_STATE_DEFAULTS = (
	backgroundColor: ContentBlockBackgroundColor,
	blockType: ContentBlockType
) => ({
	backgroundColor,
	blockType,
});

export const CONTENT_BLOCK_FIELD_DEFAULTS = () => ({
	background: BACKGROUND_COLOR_FIELD(),
});

// Recurring fields
export const BACKGROUND_COLOR_FIELD = (label: string = 'Achtergrondkleur') => ({
	label,
	editorType: ContentBlockEditor.ColorSelect,
	editorProps: {
		options: BACKGROUND_COLOR_OPTIONS,
		defaultValue: BACKGROUND_COLOR_OPTIONS[0],
	},
});

export const ALIGN_FIELD = (label: string = 'Uitlijning') => ({
	label,
	editorType: ContentBlockEditor.AlignSelect,
	editorProps: {
		options: ALIGN_OPTIONS,
	},
});

export const TEXT_FIELD = (
	label = 'Tekst',
	emptyFieldValidatorMessage = 'Tekstveld moet verplicht ingevuld zijn.'
) => ({
	label,
	editorType: ContentBlockEditor.WYSIWYG,
	editorProps: {
		id: kebabCase(label),
	},
	validator: (value: string) => {
		const errorArray: string[] = [];

		if (isNil(value) || isEmpty(value)) {
			errorArray.push(emptyFieldValidatorMessage);
		}

		return errorArray;
	},
});
