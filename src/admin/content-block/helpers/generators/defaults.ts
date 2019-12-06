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
// TODO: Default value should be white.
export const BACKGROUND_COLOR_FIELD = (label: string = 'Achtergrondkleur') => ({
	background: {
		label,
		editorType: ContentBlockEditor.ColorSelect,
		editorProps: {
			options: BACKGROUND_COLOR_OPTIONS,
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
