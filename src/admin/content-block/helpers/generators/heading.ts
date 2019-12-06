import { BACKGROUND_COLOR_OPTIONS, HEADING_LEVEL_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	HeadingBlockFormState,
} from '../../content-block.types';
import { CONTENT_BLOCK_DEFAULTS } from './defaults';

export const INITIAL_HEADING_BLOCK_STATE = (): HeadingBlockFormState => ({
	title: '',
	level: 'h1',
	align: 'left',
	...CONTENT_BLOCK_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Heading),
});

export const HEADING_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Hoofding',
	initialState: INITIAL_HEADING_BLOCK_STATE,
	fields: {
		title: {
			label: 'Titel',
			editorType: ContentBlockEditor.TextInput,
			validator: (value: string) => {
				const errorArray: string[] = [];

				if (!!value) {
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
		align: {
			label: 'Uitlijning',
			editorType: ContentBlockEditor.AlignSelect,
		},
		backgroundColor: {
			label: 'Achtergrondkleur',
			editorType: ContentBlockEditor.ColorSelect,
			editorProps: {
				options: BACKGROUND_COLOR_OPTIONS,
			},
		},
	},
});
