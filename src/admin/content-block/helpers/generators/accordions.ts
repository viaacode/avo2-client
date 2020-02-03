import i18n from '../../../../shared/translations/i18n';

import {
	AccordionsBlockComponentState,
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
} from '../../content-block.types';
import { CONTENT_BLOCK_FIELD_DEFAULTS, FORM_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

const EMPTY_ACCORDION: AccordionsBlockComponentState = {
	title: '',
	content: '',
};

export const INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES = (): AccordionsBlockComponentState[] => [
	EMPTY_ACCORDION,
];

export const INITIAL_ACCORDIONS_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.Accordions, position);

export const ACCORDIONS_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Accordeons'),
	components: {
		name: i18n.t('Accordeon'),
		limits: {
			min: 1,
			max: 8,
		},
		state: INITIAL_ACCORDIONS_BLOCK_COMPONENT_STATES(),
		fields: {
			title: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/defaults___tekst-is-verplicht'),
				{
					label: i18n.t('Titel'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
			content: TEXT_FIELD(),
		},
	},
	block: {
		state: INITIAL_ACCORDIONS_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
