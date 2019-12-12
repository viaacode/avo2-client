import {
	ButtonsBlockFormState,
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockType,
} from '../../content-block.types';
import {
	ALIGN_FIELD,
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_BUTTONS_BLOCK_STATE = (): ButtonsBlockFormState => ({
	label: '',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Buttons),
});

export const BUTTONS_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Knop(pen)',
	initialState: INITIAL_BUTTONS_BLOCK_STATE,
	fields: {
		label: TEXT_FIELD('Tekst', 'Knoptekst is verplicht'),
		align: ALIGN_FIELD(),
		...CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
