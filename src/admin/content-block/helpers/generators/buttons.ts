import i18n from '../../../../shared/translations/i18n';

import {
	ButtonsBlockComponentState,
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../content-block.types';
import {
	ALIGN_FIELD,
	BLOCK_COMPONENT_LIMITS,
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_BUTTONS_BLOCK_COMPONENT_STATES = (): ButtonsBlockComponentState[] => [
	{
		label: '',
	},
];

export const INITIAL_BUTTONS_BLOCK_STATE = (): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Buttons);

export const BUTTONS_BLOCK_CONFIG = (): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/buttons___knoppen'),
	components: {
		name: i18n.t('admin/content-block/helpers/generators/buttons___knop'),
		limits: {
			...BLOCK_COMPONENT_LIMITS(),
			max: 3,
		},
		state: INITIAL_BUTTONS_BLOCK_COMPONENT_STATES(),
		fields: {
			label: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/buttons___knoptekst-is-verplicht'),
				{
					editorType: ContentBlockEditor.TextInput,
				}
			),
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
