import i18n from '../../../../shared/translations/i18n';
import { HEADING_LEVEL_OPTIONS } from '../../content-block.const';
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
	heading: '',
	content: '',
	headingType: 'h2',
	// TODO: Add Button Props
	// button: {
	// 	label: '',
	// },
};

export const INITIAL_CTAS_BLOCK_COMPONENT_STATES = (): CTAsBlockComponentState[] => [
	EMPTY_CTA,
	EMPTY_CTA,
];

export const INITIAL_CTAS_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.CTAs, position);

export const CTAS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t("CTA's"),
	components: {
		name: i18n.t('admin/content-block/helpers/generators/ctas___cta'),
		limits: {
			min: 2,
			max: 2,
		},
		state: INITIAL_CTAS_BLOCK_COMPONENT_STATES(),
		fields: {
			heading: TEXT_FIELD(i18n.t('admin/content-block/helpers/generators/ctas___knoptekst'), {
				editorType: ContentBlockEditor.TextInput,
			}),
			content: TEXT_FIELD(i18n.t('admin/content-block/helpers/generators/ctas___knoptekst')),
			headingType: {
				label: i18n.t('admin/content-block/helpers/generators/heading___stijl'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: HEADING_LEVEL_OPTIONS,
				},
			},
			// TODO: Add Button Fields
		},
	},
	block: {
		state: INITIAL_CTAS_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
