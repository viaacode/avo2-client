import i18n from '../../../../shared/translations/i18n';

import { BUTTON_TYPE_OPTIONS, CTA_ICON_OPTIONS } from '../../content-block.const';

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
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_BUTTONS_BLOCK_COMPONENT_STATES = (): ButtonsBlockComponentState[] => [
	{
		label: '',
		type: 'primary',
	},
];

export const INITIAL_BUTTONS_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Buttons, position);

export const BUTTONS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/buttons___knoppen'),
	components: {
		name: i18n.t('admin/content-block/helpers/generators/buttons___knop'),
		limits: {
			max: 3,
		},
		state: INITIAL_BUTTONS_BLOCK_COMPONENT_STATES(),
		fields: {
			type: {
				label: i18n.t('Type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: BUTTON_TYPE_OPTIONS,
				},
			},
			label: TEXT_FIELD(i18n.t('Knoptekst is verplicht'), {
				label: i18n.t('Tekst'),
				editorType: ContentBlockEditor.TextInput,
			}),
			icon: {
				label: i18n.t('Icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: CTA_ICON_OPTIONS,
				},
			},
		},
	},
	block: {
		state: INITIAL_BUTTONS_BLOCK_STATE(position),
		fields: {
			align: ALIGN_FIELD(),
			...CONTENT_BLOCK_FIELD_DEFAULTS(),
		},
	},
});
