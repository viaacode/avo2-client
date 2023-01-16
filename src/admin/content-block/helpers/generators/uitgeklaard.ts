import {
	BLOCK_FIELD_DEFAULTS,
	BLOCK_STATE_DEFAULTS,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockField,
	ContentBlockType,
	DefaultContentBlockState,
	KlaarBlockComponentState,
	TEXT_FIELD,
} from '@meemoo/admin-core-ui';
import { isEmpty, isNil } from 'lodash-es';

import i18n from '../../../../shared/translations/i18n';

export const INITIAL_UITGEKLAARD_COMPONENTS_STATE = (): KlaarBlockComponentState => ({
	titles: [''],
	date: '',
});

export const INITIAL_UITGEKLAARD_BLOCK_STATE = (): DefaultContentBlockState =>
	BLOCK_STATE_DEFAULTS({
		padding: {
			top: 'none',
			bottom: 'none',
		},
	});

export const UITGEKLAARD_BLOCK_CONFIG = (position = 0): ContentBlockConfig => ({
	position,
	name: i18n.t('admin/content-block/helpers/generators/uitgeklaard___uitgeklaard'),
	type: ContentBlockType.Uitgeklaard,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/uitgeklaard___uitgeklaard-titel'),
		limits: {
			max: 3,
		},
		state: INITIAL_UITGEKLAARD_COMPONENTS_STATE(),
		fields: {
			titles: TEXT_FIELD(
				i18n.t('admin/content-block/helpers/generators/uitgeklaard___titel-is-verplicht'),
				{
					label: i18n.t('admin/content-block/helpers/generators/uitgeklaard___titel'),
					editorType: ContentBlockEditor.TextInput,
					repeat: {
						defaultState: '',
						addButtonLabel: i18n.t(
							'admin/content-block/helpers/generators/uitgeklaard___voeg-titel-toe'
						),
						deleteButtonLabel: i18n.t(
							'admin/content-block/helpers/generators/uitgeklaard___verwijder-titel'
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
								'admin/content-block/helpers/generators/uitgeklaard___datum-is-verplicht'
							)
						);
					}

					return errorArray;
				},
			},
		},
	},
	block: {
		state: INITIAL_UITGEKLAARD_BLOCK_STATE(),
		fields: {
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
