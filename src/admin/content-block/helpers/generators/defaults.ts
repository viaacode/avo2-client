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
	...BACKGROUND_COLOR_FIELD(),
});

// Recurring fields
export const BACKGROUND_COLOR_FIELD = (label: string = 'Achtergrondkleur') => ({
	backgroundColor: {
		label,
		editorType: ContentBlockEditor.ColorSelect,
		editorProps: {
			options: BACKGROUND_COLOR_OPTIONS,
			defaultValue: BACKGROUND_COLOR_OPTIONS[0],
		},
	},
});

export const ALIGN_FIELD = (label: string = 'Uitlijning') => ({
	align: {
		label,
		editorType: ContentBlockEditor.AlignSelect,
		editorProps: {
			options: ALIGN_OPTIONS,
		},
	},
});
