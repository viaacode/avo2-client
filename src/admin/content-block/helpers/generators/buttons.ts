import i18n from '../../../../shared/translations/i18n';
import { GET_ADMIN_ICON_OPTIONS } from '../../../shared/constants';
import {
	ButtonsBlockComponentState,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../../shared/types';
import { GET_BUTTON_TYPE_OPTIONS } from '../../content-block.const';

import { ALIGN_FIELD, BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_BUTTONS_COMPONENTS_STATE = (): ButtonsBlockComponentState[] => [
	{
		label: '',
		type: 'primary',
	},
];

export const INITIAL_BUTTONS_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'none',
			bottom: 'bottom-extra-large',
		},
	});

export const BUTTONS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	position,
	name: i18n.t('admin/content-block/helpers/generators/buttons___knoppen'),
	type: ContentBlockType.Buttons,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/buttons___knop'),
		limits: {
			max: 3,
		},
		state: INITIAL_BUTTONS_COMPONENTS_STATE(),
		fields: {
			type: {
				label: i18n.t('admin/content-block/helpers/generators/buttons___type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_BUTTON_TYPE_OPTIONS(),
				},
			},
			label: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/buttons___knoptekst-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/buttons___tekst'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			altTitle: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/buttons___alt-title-text'),
				editorType: ContentBlockEditor.TextInput,
			}),
			icon: {
				label: i18n.t('admin/content-block/helpers/generators/buttons___icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: GET_ADMIN_ICON_OPTIONS(),
				},
			},
			buttonAction: {
				label: i18n.t('admin/content-block/helpers/generators/buttons___knop-actie'),
				editorType: ContentBlockEditor.ContentPicker,
			},
		},
	},
	block: {
		state: INITIAL_BUTTONS_BLOCK_STATE(),
		fields: {
			align: ALIGN_FIELD(),
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
