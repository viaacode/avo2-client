import i18n from '../../../../shared/translations/i18n';

import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	KlaarBlockComponentState,
} from '../../../shared/types';
import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_KLAAR_COMPONENTS_STATE = (): KlaarBlockComponentState[] => [
	{
		title: '',
	},
];

export const INITIAL_KLAAR_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS(ContentBlockType.KLAAR, position);

export const KLAAR_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/klaar___klaar'),
	type: ContentBlockType.KLAAR,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/klaar___klaar-titel'),
		limits: {
			max: 3,
		},
		state: INITIAL_KLAAR_COMPONENTS_STATE(),
		fields: {
			title: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/klaar___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/klaar___titel'),
					editorType: ContentBlockEditor.TextInput,
				}
			),
		},
	},
	block: {
		state: INITIAL_KLAAR_BLOCK_STATE(position),
		fields: {
			date: {
				label: 'Datum',
				editorType: ContentBlockEditor.DatePicker,
			},
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
