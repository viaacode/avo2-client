import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	IntroBlockFormState,
} from '../../content-block.types';
import {
	ALIGN_FIELD,
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_INTRO_BLOCK_STATE = (): IntroBlockFormState => ({
	headingTitle: '',
	introContent: '',
	align: 'left',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Intro),
});

export const INTRO_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Intro',
	initialState: INITIAL_INTRO_BLOCK_STATE,
	fields: {
		headingTitle: TEXT_FIELD('Titel is verplicht.', {
			label: 'Titel',
			editorType: ContentBlockEditor.TextInput,
		}),
		introContent: TEXT_FIELD(),
		align: ALIGN_FIELD(),
		...CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
