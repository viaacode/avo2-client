import i18n from '../../../../shared/translations/i18n';
import { GET_ADMIN_ICON_OPTIONS } from '../../../shared/constants';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	RichTextBlockComponentState,
} from '../../../shared/types';
import { GET_BUTTON_TYPE_OPTIONS } from '../../content-block.const';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_RICH_TEXT_COMPONENTS_STATE = (): RichTextBlockComponentState => ({
	content: '',
	buttons: [],
});

export const INITIAL_RICH_TEXT_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.RichText, position);

export const RICH_TEXT_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/rich-text___tekst'),
	type: ContentBlockType.RichText,
	components: {
		limits: {
			max: 1,
		},
		state: INITIAL_RICH_TEXT_COMPONENTS_STATE(),
		fields: {
			content: TEXT_FIELD(),
			buttons: {
				label: i18n.t('Knop'),
				fields: {
					type: {
						label: i18n.t('admin/content-block/helpers/generators/buttons___type'),
						editorType: ContentBlockEditor.Select,
						editorProps: {
							options: GET_BUTTON_TYPE_OPTIONS(),
						},
					},
					label: TEXT_FIELD(
						i18n.t(
							'admin/content-block/helpers/generators/buttons___knoptekst-is-verplicht'
						),
						{
							label: i18n.t('admin/content-block/helpers/generators/buttons___tekst'),
							editorType: ContentBlockEditor.TextInput,
						}
					),
					icon: {
						label: i18n.t('admin/content-block/helpers/generators/buttons___icoon'),
						editorType: ContentBlockEditor.IconPicker,
						editorProps: {
							options: GET_ADMIN_ICON_OPTIONS(),
						},
					},
					buttonAction: {
						label: i18n.t(
							'admin/content-block/helpers/generators/buttons___knop-actie'
						),
						editorType: ContentBlockEditor.ContentPicker,
					},
				},
				type: 'fieldGroup',
				min: 0,
				max: 10,
				repeat: true,
				repeatAddButtonLabel: i18n.t('Voeg knop toe'),
				repeatDeleteButtonLabel: i18n.t('Verwijder knop'),
			},
		},
	},
	block: {
		state: INITIAL_RICH_TEXT_BLOCK_STATE(position),
		fields: BLOCK_FIELD_DEFAULTS(),
	},
});
