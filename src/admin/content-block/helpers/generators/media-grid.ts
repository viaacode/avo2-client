import { ContentPickerType, MultiRangeProps } from '@viaa/avo2-components';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import { GET_ADMIN_ICON_OPTIONS } from '../../../shared/constants';
import {
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	MediaGridBlockComponentState,
	MediaGridBlockState,
} from '../../../shared/types';
import {
	GET_BACKGROUND_COLOR_OPTIONS,
	GET_BUTTON_TYPE_OPTIONS,
	GET_FULL_HEADING_TYPE_OPTIONS,
} from '../../content-block.const';

import {
	BACKGROUND_COLOR_FIELD,
	BLOCK_FIELD_DEFAULTS,
	BLOCK_STATE_DEFAULTS,
	FOREGROUND_COLOR_FIELD,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_MEDIA_GRID_COMPONENTS_STATE = (): MediaGridBlockComponentState[] => [{}];

export const INITIAL_MEDIA_GRID_BLOCK_STATE = (position: number): MediaGridBlockState => ({
	...BLOCK_STATE_DEFAULTS({
		position,
		blockType: ContentBlockType.MediaGrid,
		padding: {
			top: 'top-large',
			bottom: 'bottom-small',
		},
	}),
	ctaTitle: '',
	ctaContent: '',
	ctaButtonLabel: '',
	ctaButtonAction: { type: 'ITEM', value: '' },
	searchQuery: { type: 'SEARCH_QUERY', value: '' },
	searchQueryLimit: '8',
});

export const MEDIA_GRID_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	position,
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
					allowedTypes: ['ITEM', 'COLLECTION', 'BUNDLE'] as ContentPickerType[],
				},
			},
			buttonLabel: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___knop-tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonIcon: {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___knop-icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: GET_ADMIN_ICON_OPTIONS(),
				},
			},
			buttonType: {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___knop-type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_BUTTON_TYPE_OPTIONS(),
				},
			},
			buttonAction: {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___knop-actie'),
				editorType: ContentBlockEditor.ContentPicker,
			},
		},
	},
	block: {
		state: INITIAL_MEDIA_GRID_BLOCK_STATE(),
		fields: {
			title: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___algemene-titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonLabel: TEXT_FIELD('', {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___algemene-knop-tekst'
				),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			buttonAction: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___algemene-knop-actie'
				),
				editorType: ContentBlockEditor.ContentPicker,
			},
			searchQuery: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___voeg-een-zoek-filter-toe'
				),
				editorType: ContentBlockEditor.ContentPicker,
				editorProps: {
					allowedTypes: ['SEARCH_QUERY'] as ContentPickerType[],
					hideTypeDropdown: true,
				},
			},
			searchQueryLimit: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___zoekresultaten-limiet'
				),
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
			ctaTitleColor: FOREGROUND_COLOR_FIELD(
				i18n.t('admin/content-block/helpers/generators/media-grid___cta-titel-kleur')
			),
			ctaTitleSize: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___cta-titel-grootte'
				),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_FULL_HEADING_TYPE_OPTIONS(),
				},
			},
			ctaContent: TEXT_FIELD('', {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___cta-omschrijving'
				),
				editorType: ContentBlockEditor.TextArea,
				validator: undefined,
			}),
			ctaContentColor: FOREGROUND_COLOR_FIELD(
				i18n.t('admin/content-block/helpers/generators/media-grid___cta-omschrijving-kleur')
			),
			ctaButtonLabel: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___cta-knop-tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: undefined,
			}),
			ctaButtonIcon: {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___cta-knop-icoon'),
				editorType: ContentBlockEditor.IconPicker,
				editorProps: {
					options: GET_ADMIN_ICON_OPTIONS(),
				},
			},
			ctaButtonType: {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___cta-knop-type'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: GET_BUTTON_TYPE_OPTIONS(),
				},
			},
			ctaButtonAction: {
				label: i18n.t('admin/content-block/helpers/generators/media-grid___cta-knop-actie'),
				editorType: ContentBlockEditor.ContentPicker,
			},
			ctaBackgroundColor: BACKGROUND_COLOR_FIELD(
				i18n.t('admin/content-block/helpers/generators/media-grid___cta-achtergrond-kleur'),
				GET_BACKGROUND_COLOR_OPTIONS()[1]
			),
			ctaBackgroundImage: {
				label: i18n.t(
					'admin/content-block/helpers/generators/media-grid___cta-achtergrond-afbeelding'
				),
				editorType: ContentBlockEditor.FileUpload,
				validator: undefined,
				editorProps: {
					assetType: 'CONTENT_PAGE_IMAGE',
					allowMulti: false,
				} as FileUploadProps,
			},
			...BLOCK_FIELD_DEFAULTS(),
		},
	},
});
