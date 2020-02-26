import { MultiRangeProps } from '@viaa/avo2-components/dist/components/MultiRange/MultiRange';
import { GridItem } from '@viaa/avo2-components/dist/content-blocks/BlockGrid/BlockGrid';

import { FileUploadProps } from '../../../../shared/components/FileUpload/FileUpload';
import i18n from '../../../../shared/translations/i18n';
import {
	BackgroundColorOption,
	ContentBlockConfig,
	ContentBlockEditor,
	ContentBlockType,
	ImageGridBlockComponentStateBlockFields,
	ImageGridBlockComponentStateFields,
} from '../../../shared/types';

import { ALIGN_OPTIONS, FILL_OPTIONS } from '../../content-block.const';
import {
	CONTENT_BLOCK_FIELD_DEFAULTS,
	FILE_FIELD,
	FORM_STATE_DEFAULTS,
	TEXT_FIELD,
} from './defaults';

export const INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATES = (): ImageGridBlockComponentStateFields[] => [
	{
		source: undefined,
		title: '',
		text: '',
		action: undefined,
	} as any,
];

export const INITIAL_IMAGE_GRID_BLOCK_STATE = (
	position: number
): ImageGridBlockComponentStateBlockFields => {
	return {
		...FORM_STATE_DEFAULTS(BackgroundColorOption.White, ContentBlockType.ImageGrid, position),
		elements: [] as GridItem[],
		imageWidth: 200,
		imageHeight: 200,
		itemWidth: 200,
		fill: 'cover',
		textAlign: 'center',
	};
};

export const IMAGE_GRID_BLOCK_CONFIG = (position: number = 0): ContentBlockConfig => ({
	name: i18n.t('admin/content-block/helpers/generators/image-grid___afbeeldingen-grid'),
	type: ContentBlockType.ImageGrid,
	components: {
		name: i18n.t('admin/content-block/helpers/generators/image-grid___item'),
		state: INITIAL_IMAGE_GRID_BLOCK_COMPONENT_STATES(),
		fields: {
			source: FILE_FIELD(
				i18n.t(
					'admin/content-block/helpers/generators/image-grid___een-afbeelding-is-verplicht'
				),
				{
					label: i18n.t('admin/content-block/helpers/generators/image-grid___afbeelding'),
					editorProps: {
						assetType: 'CONTENT_PAGE_IMAGE',
						allowMulti: false,
					} as FileUploadProps,
				}
			),
			title: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___titel'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			}),
			text: TEXT_FIELD('', {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___tekst'),
				editorType: ContentBlockEditor.TextInput,
				validator: () => [],
			}),
			// action: // TODO add content picker to select what has to happen when the user clicks an element in the grid
		},
	},
	block: {
		state: INITIAL_IMAGE_GRID_BLOCK_STATE(position),
		fields: {
			...CONTENT_BLOCK_FIELD_DEFAULTS(),
			imageWidth: {
				label: i18n.t(
					'admin/content-block/helpers/generators/image-grid___afbeelding-breedte'
				),
				editorType: ContentBlockEditor.MultiRange,
				validator: () => [],
				editorProps: {
					min: 0,
					max: 800,
					step: 1,
					values: [200],
				} as MultiRangeProps,
			},
			imageHeight: {
				label: i18n.t(
					'admin/content-block/helpers/generators/image-grid___afbeelding-hoogte'
				),
				editorType: ContentBlockEditor.MultiRange,
				validator: () => [],
				editorProps: {
					min: 0,
					max: 800,
					step: 1,
					values: [200],
				} as MultiRangeProps,
			},
			itemWidth: {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___item-breedte'),
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
				label: i18n.t('admin/content-block/helpers/generators/image-grid___zoom'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: FILL_OPTIONS,
				},
			},
			textAlign: {
				label: i18n.t('admin/content-block/helpers/generators/image-grid___text-alignatie'),
				editorType: ContentBlockEditor.Select,
				editorProps: {
					options: ALIGN_OPTIONS,
				},
			},
		},
	},
});
