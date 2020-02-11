import { MultiRangeProps } from '@viaa/avo2-components/dist/components/MultiRange/MultiRange';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import { IMAGE_GRID_FILL_OPTIONS } from '../../content-block.const';
import {
	ContentBlockBackgroundColor,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	DefaultContentBlockState,
	ImageGridBlockComponentState,
} from '../../content-block.types';

import { CONTENT_BLOCK_FIELD_DEFAULTS, FILE_FIELD, FORM_STATE_DEFAULTS } from './defaults';

export const INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATE = (): ImageGridBlockComponentState => ({
	images: [],
	width: 200,
	height: 200,
	fill: 'cover',
});

export const INITIAL_IMAGE_GRID_BLOCK_STATE = (position: number): DefaultContentBlockState =>
	FORM_STATE_DEFAULTS(ContentBlockBackgroundColor.White, ContentBlockType.ImageGrid, position);

export const IMAGE_GRID_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('Lijst van afbeeldingen'),
	components: {
		state: INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATE(),
		fields: {
			width: {
				label: i18n.t('Breedte'),
				editorType: ContentBlockEditor.MultiRange,
				validator: () => [],
				editorProps: {
					min: 0,
					max: 800,
					step: 1,
					values: [200],
				} as MultiRangeProps,
			},
			height: {
				label: i18n.t('Hoogte'),
				editorType: ContentBlockEditor.MultiRange,
				validator: () => [],
				editorProps: {
					min: 0,
					max: 800,
					step: 1,
					values: [200],
				} as MultiRangeProps,
			},
			fill: {
				label: i18n.t('Zoom'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: IMAGE_GRID_FILL_OPTIONS,
				},
			},
			images: FILE_FIELD(i18n.t('Een afbeelding is verplicht'), {
				label: i18n.t('Afbeeldingen'),
				editorProps: { assetType: 'CONTENT_PAGE_IMAGE' } as FileUploadProps,
			}),
		},
	},
	block: {
		state: INITIAL_IMAGE_GRID_BLOCK_STATE(position),
		fields: CONTENT_BLOCK_FIELD_DEFAULTS(),
	},
});
