import {
	ButtonsBlockComponentState,
	ButtonsBlockState,
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
} from '../../content-block.types';
import {
	ALIGN_FIELD,
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_BUTTONS_BLOCK_COMPONENT_STATES = (): ButtonsBlockComponentState[] => [
	{
		label: '',
	},
];

export const INITIAL_BUTTONS_BLOCK_STATE = (): ButtonsBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Buttons);

export const BUTTONS_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Knoppen',
	components: {
		name: 'Knop',
		state: INITIAL_BUTTONS_BLOCK_COMPONENT_STATES(),
		fields: {
			label: TEXT_FIELD('Knoptekst is verplicht.', {
				editorType: ContentBlockEditor.TextInput,
			}),
		},
	},
	block: {
		state: INITIAL_BUTTONS_BLOCK_STATE(),
		fields: {
			align: ALIGN_FIELD(),
			...CONTENT_BLOCK_FIELD_DEFAULTS(),
		},
	},
});
