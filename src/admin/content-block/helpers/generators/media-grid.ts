import i18n from '../../../../shared/translations/i18n';

import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	MediaGridBlockComponentState,
	MediaGridBlockState,
} from '../../../shared/types';
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
	name: i18n.t('Media tegels'),
	type: ContentBlockType.MediaGrid,
	components: {
		name: i18n.t('Media item'),
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
			ctaTitle: TEXT_FIELD('', {
				label: i18n.t('CTA titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			ctaContent: TEXT_FIELD('', {
				label: i18n.t('CTA omschrijving'),
				editorType: ContentBlockEditor.TextArea,
				validator: undefined,
			}),
			ctaButtonLabel: TEXT_FIELD('', {
				label: i18n.t('CTA knop: Tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			ctaButtonAction: {
				label: i18n.t('CTA knop: Actie'),
				editorType: ContentBlockEditor.ContentPicker,
			},
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
