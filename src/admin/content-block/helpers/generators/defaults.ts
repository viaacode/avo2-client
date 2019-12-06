import { BACKGROUND_COLOR_OPTIONS, HEADING_ALIGN_OPTIONS } from '../../content-block.const';
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

export const FIELD_DEFAULTS = () => ({
	backgroundColor: {
		label: 'Achtergrondkleur',
		editorType: ContentBlockEditor.ColorSelect,
		editorProps: {
			options: BACKGROUND_COLOR_OPTIONS,
		},
	},
});

// Returning fields
export const ALIGN_FIELD = (label: string = 'Uitlijning') => ({
	align: {
		label,
		editorType: ContentBlockEditor.AlignSelect,
		editorProps: {
			options: HEADING_ALIGN_OPTIONS,
		},
	},
});
