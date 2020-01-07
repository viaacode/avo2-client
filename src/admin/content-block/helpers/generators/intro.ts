import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	IntroBlockComponentState,
	IntroBlockState,
} from '../../content-block.types';
import {
	ALIGN_FIELD,
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_INTRO_BLOCK_COMPONENT_STATE = (): IntroBlockComponentState => ({
	title: '',
	text: '',
	align: 'left',
	...FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Intro),
});

export const INITIAL_INTRO_BLOCK_STATE = (): IntroBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Buttons);

export const INTRO_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: 'Intro',
	components: {
		state: INITIAL_INTRO_BLOCK_COMPONENT_STATE(),
		fields: {
			title: TEXT_FIELD('Titel is verplicht.', {
				label: 'Titel',
				editorType: ContentBlockEditor.TextInput,
			}),
			align: ALIGN_FIELD('Titel uitlijning'),
			text: TEXT_FIELD(),
		},
	},
	block: {
		state: INITIAL_INTRO_BLOCK_STATE(),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
