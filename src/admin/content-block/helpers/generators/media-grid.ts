import i18n from '../../../../shared/translations/i18n';

import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	MediaGridBlockComponentState,
	MediaGridBlockState,
} from '../../content-block.types';
import { BLOCK_FIELD_DEFAULTS, BLOCK_STATE_DEFAULTS, TEXT_FIELD } from './defaults';

export const INITIAL_MEDIA_GRID_COMPONENTS_STATE = (): MediaGridBlockComponentState[] => [{}];

export const INITIAL_MEDIA_GRID_BLOCK_STATE = (position: number): MediaGridBlockState => ({
	...BLOCK_STATE_DEFAULTS(ContentBlockType.MediaGrid, position),
	ctaTitle: '',
	ctaContent: '',
	ctaButtonLabel: '',
	ctaButtonAction: { type: 'ITEM', value: '' },
});

export const MEDIA_GRID_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Media grid'),
	type: ContentBlockType.MediaGrid,
	components: {
		name: i18n.t('Media item'),
		limits: {
			min: 1,
			max: 8,
		},
		state: INITIAL_MEDIA_GRID_COMPONENTS_STATE(),
		fields: {
			mediaItem: {
				label: i18n.t('Selecteer uit items en collecties'),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					selectableTypes: ['ITEM', 'COLLECTION'],
				},
			},
		},
	},
	block: {
		state: INITIAL_MEDIA_GRID_BLOCK_STATE(position),
		fields: {
			ctaTitle: TEXT_FIELD(i18n.t('CTA titel is verplicht'), {
				label: i18n.t('CTA titel'),
				editorType: ContentBlockEditor.TextInput,
			}),
			ctaContent: TEXT_FIELD(i18n.t('CTA content is verplicht'), {
				label: i18n.t('CTA omschrijving'),
				editorType: ContentBlockEditor.TextArea,
			}),
			ctaButtonLabel: TEXT_FIELD(i18n.t('CTA knop tekst is verplicht'), {
				label: i18n.t('CTA knop: Tekst'),
				editorType: ContentBlockEditor.TextInput,
			}),
			ctaButtonAction: {
				label: i18n.t('CTA knop: Actie'),
				editorType: ContentBlockEditor.ContentPicker,
			},
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
