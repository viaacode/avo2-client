import i18n from '../../../../shared/translations/i18n';

import { ADMIN_ICON_OPTIONS } from '../../../shared/constants';
import { BUTTON_TYPE_OPTIONS, HEADING_LEVEL_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	CTAsBlockComponentState,
	DefaultContentBlockState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

const EMPTY_CTA: CTAsBlockComponentState = {
	headingType: 'h2',
	heading: '',
	content: '',
	buttonType: 'secondary',
	buttonLabel: '',
};

export const INITIAL_CTAS_BLOCK_COMPONENT_STATES = (): CTAsBlockComponentState[] => [
	EMPTY_CTA,
	EMPTY_CTA,
];

export const INITIAL_CTAS_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.CTAs, position);

export const CTAS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t("CTA's"),
	type: ContentBlockType.CTAs,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/ctas___cta'),
		limits: {
			min: 2,
			max: 2,
		},
		state: INITIAL_CTAS_BLOCK_COMPONENT_STATES(),
		fields: {
			headingType: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___titel-stijl'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: HEADING_LEVEL_OPTIONS,
				},
			},
			heading: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/ctas___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/ctas___titel-tekst'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			content: TEXT_FIELD(),
			buttonType: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___knop-type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: BUTTON_TYPE_OPTIONS,
				},
			},
			buttonLabel: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/ctas___knoptekst-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/ctas___knop-tekst'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			buttonIcon: {
				label: i18n.t('admin/content-block/helpers/generators/ctas___knop-icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: ADMIN_ICON_OPTIONS,
				},
			},
			buttonAction: {
				label: i18n.t('Knop: Actie'),
				editorType: ContentBlockEditor.ContentPicker,
			},
		},
	},
	block: {
		state: INITIAL_CTAS_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
