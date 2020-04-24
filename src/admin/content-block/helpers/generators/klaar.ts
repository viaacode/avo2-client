import i18n from '../../../../shared/translations/i18n';

import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	KlaarBlockComponentState,
} from '../../../shared/types';
import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_KLAAR_COMPONENTS_STATE = (): KlaarBlockComponentState => ({
	titles: [''],
	date: '',
});

export const INITIAL_KLAAR_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.Klaar, position);

export const KLAAR_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('KLAAR'),
	type: ContentBlockType.Klaar,
	components: {
		name: i18n.t('KLAAR Titel'),
		limits: {
			max: 3,
		},
		state: INITIAL_KLAAR_COMPONENTS_STATE(),
		fields: {
			titles: TEXT_FIELD(i18n.t('Titel is verplicht.'), {
				label: i18n.t('Titel'),
				editorType: ContentBlockEditor.TextInput,
				repeat: true,
			}),
			date: {
				label: 'Datum',
				editorType: ContentBlockEditor.DatePicker,
			},
		},
	},
	block: {
		state: INITIAL_KLAAR_BLOCK_STATE(position),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
