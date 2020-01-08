import { isEmpty, isNil } from 'lodash-es';
import i18n from '../../../../shared/translations/i18n';

import { ALIGN_OPTIONS, BACKGROUND_COLOR_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockEditor,
	ContentBlockField,
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
	backgroundColor: BACKGROUND_COLOR_FIELD(),
});

// Recurring fields
export const BACKGROUND_COLOR_FIELD = (
	label: string = i18n.t('admin/content-block/helpers/generators/defaults___achtergrondkleur')
) => ({
	label,
	editorType: ContentBlockEditor.ColorSelect,
	editorProps: {
		options: BACKGROUND_COLOR_OPTIONS,
		defaultValue: BACKGROUND_COLOR_OPTIONS[0],
	},
});

export const ALIGN_FIELD = (
	label: string = i18n.t('admin/content-block/helpers/generators/defaults___uitlijning')
) => ({
	label,
	editorType: ContentBlockEditor.AlignSelect,
	editorProps: {
		options: ALIGN_OPTIONS,
	},
});

export const TEXT_FIELD = (
	emptyFieldValidatorMessage = i18n.t(
		'admin/content-block/helpers/generators/defaults___tekst-is-verplicht'
	),
	propOverride?: Partial<ContentBlockField>
) => ({
	label: i18n.t('admin/content-block/helpers/generators/defaults___tekst'),
	editorType: ContentBlockEditor.WYSIWYG,
	validator: (value: string) => {
		const errorArray: string[] = [];

		if (isNil(value) || isEmpty(value)) {
			errorArray.push(emptyFieldValidatorMessage);
		}

		return errorArray;
	},
	...propOverride,
});
