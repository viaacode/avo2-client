import i18n from '../../../../shared/translations/i18n';

import { ADMIN_ICON_OPTIONS } from '../../../shared/constants';
import { BUTTON_TYPE_OPTIONS } from '../../content-block.const';

import {
	BackgroundColorOption,
	ButtonsBlockComponentState,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../../shared/types';

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
	FORM_STATE_DEFAULTS(BackgroundColorOption.White, ContentBlockType.Buttons, position);

export const BUTTONS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/buttons___knoppen'),
	type: ContentBlockType.Buttons,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/buttons___knop'),
		limits: {
			max: 3,
		},
		state: INITIAL_BUTTONS_BLOCK_COMPONENT_STATES(),
		fields: {
			type: {
				label: i18n.t('admin/content-block/helpers/generators/buttons___type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: BUTTON_TYPE_OPTIONS,
				},
			},
			label: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/buttons___knoptekst-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/buttons___tekst'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			icon: {
				label: i18n.t('admin/content-block/helpers/generators/buttons___icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: ADMIN_ICON_OPTIONS,
				},
			},
			action: {
				label: i18n.t('admin/content-block/helpers/generators/buttons___knop-actie'),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: [
						'CONTENT_PAGE',
						'ITEM',
						'COLLECTION',
						'BUNDLE',
						'INTERNAL_LINK',
						'EXTERNAL_LINK',
					],
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
