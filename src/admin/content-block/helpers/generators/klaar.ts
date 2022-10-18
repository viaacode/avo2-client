import { isEmpty, isNil } from 'lodash-es';

import i18n from '../../../../shared/translations/i18n';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockField,
	ContentBlockType,
	DefaultContentBlockState,
	KlaarBlockComponentState,
} from '../../../shared/types';

import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_KLAAR_COMPONENTS_STATE = (): KlaarBlockComponentState => ({
	titles: [''],
	date: '',
});

export const INITIAL_KLAAR_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'none',
			bottom: 'none',
		},
	});

export const KLAAR_BLOCK_CONFIG = (position = 0): ContentBlockConfig => ({
	position,
	name: i18n.t('admin/content-block/helpers/generators/klaar___klaar'),
	type: ContentBlockType.Klaar,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/klaar___klaar-titel'),
		limits: {
			max: 3,
		},
		state: INITIAL_KLAAR_COMPONENTS_STATE(),
		fields: {
			titles: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/klaar___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/klaar___titel'),
					editorType: ContentBlockEditor.TextInput,
					repeat: {
						defaultState: '',
						addButtonLabel: i18n.t(
							'admin/content-block/helpers/generators/klaar___voeg-titel-toe'
						),
						deleteButtonLabel: i18n.t(
							'admin/content-block/helpers/generators/klaar___verwijder-titel'
						),
					},
				}
			) as ContentBlockField,
			date: {
				label: 'Datum',
				editorType: ContentBlockEditor.DatePicker,
				validator: (value: string) => {
					const errorArray: string[] = [];

					if (isNil(value) || isEmpty(value)) {
						errorArray.push(
							i18n.t(
								'admin/content-block/helpers/generators/klaar___datum-is-verplicht'
							)
						);
					}

					return errorArray;
				},
			},
		},
	},
	block: {
		state: INITIAL_KLAAR_BLOCK_STATE(),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
