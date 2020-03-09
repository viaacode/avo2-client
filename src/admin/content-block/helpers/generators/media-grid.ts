import { ContentPickerType } from '@viaa/avo2-components';
import { MultiRangeProps } from '@viaa/avo2-components/dist/components/MultiRange/MultiRange';

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
	searchQuery: { type: 'SEARCH_QUERY', value: '' },
	searchQueryLimit: '8',
});

export const MEDIA_GRID_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/media-grid___media-tegels'),
	type: ContentBlockType.MediaGrid,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/media-grid___media-item'),
		state: INITIAL_MEDIA_GRID_COMPONENTS_STATE(),
		fields: {
			mediaItem: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___selecteer-uit-items-en-collecties'
				),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: ['COLLECTION', 'ITEM'] as ContentPickerType[],
				},
			},
		},
	},
	block: {
		state: INITIAL_MEDIA_GRID_BLOCK_STATE(position),
		fields: {
			searchQuery: {
				label: i18n.t('Voeg een zoek filter toe'),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: ['SEARCH_QUERY'] as ContentPickerType[],
				},
			},
			searchQueryLimit: {
				label: i18n.t('Zoekresultaten limiet'),
				editorType: ContentBlockEditor.MultiRange,
				editorProps: {
					min: 0,
					max: 20,
					step: 1,
					showNumber: true,
				} as MultiRangeProps,
			},
			ctaTitle: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___cta-titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			ctaContent: TEXT_FIELD('', {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___cta-omschrijving'
				),
				editorType: ContentBlockEditor.TextArea,
				validator: undefined,
			}),
			ctaButtonLabel: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___cta-knop-tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			ctaButtonAction: {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___cta-knop-actie'),
				editorType: ContentBlockEditor.ContentPicker,
			},
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
